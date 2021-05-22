import fetch from "../../../../rdf/rdf-fetch";
import * as N3 from "n3";
import {PimClass} from "../../../pim/pim-class";
import {LanguageString} from "../../../platform-model-api";
import {Quad} from "n3";
import {PimAssociation} from "../../../pim/pim-association";
import {CimAdapter} from "../cim-adapters-api";
import {Store} from "../../../platform-model-store";
import IdProvider from "../../../IdProvider";

// todo fix injection
function createSearchQuery(searchString: string) {
    return `PREFIX z: <https://slovník.gov.cz/základní/pojem/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

CONSTRUCT WHERE {
    ?node a z:typ-objektu ;
        skos:prefLabel ?label ; skos:definition ?definition ;
        skos:inScheme ?glossary .

    FILTER (regex(lcase(str(?label)), "${searchString}" ))
    FILTER (LANG(?label) = "cs")
}
LIMIT 20`;
}

function classExistsQuery(id: string) {
    return `PREFIX z: <https://slovník.gov.cz/základní/pojem/>
ASK WHERE { <${id}> a z:typ-objektu . }`;
}

function getSurroundingsQuery(id: string) {
    return `PREFIX z: <https://slovník.gov.cz/základní/pojem/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

CONSTRUCT {
    ?node rdfs:subClassOf ?subClassOf .

    ?node skos:prefLabel ?label ; skos:definition ?definition .

    ?association rdfs:domain ?node ;
        rdfs:range ?association_node ;
        a <__association> .

    ?reverse_association rdfs:range ?node ;
        rdfs:domain ?reverse_association_node ;
        a <__association> .

    ?attribute a z:typ-vlastnosti ;
        skos:prefLabel ?attribute_label ;
        skos:inScheme ?attribute_glossary ;
        <__attribute_for> ?node .
} WHERE {
    {
        ?node rdfs:subClassOf ?subClassOf .
    } union
    {
        ?node skos:prefLabel ?label ; skos:definition ?definition .
    } union
    {
        ?association rdfs:domain ?node ;
            rdfs:range ?association_node .
    } union
    {
        ?reverse_association rdfs:range ?node ;
            rdfs:domain ?reverse_association_node .
    } union
    {
        ?attribute a z:typ-vlastnosti ;
            skos:prefLabel ?attribute_label ;
            skos:inScheme ?attribute_glossary ;
            rdfs:subClassOf [
                owl:allValuesFrom ?node ;
                owl:onProperty z:je-vlastností
            ] .
    }

    FILTER(?node = <${id}>)
}`;
}

async function parseN3IntoStore(source: string): Promise<N3.Store> {
    let parser = new N3.Parser();
    let store = new N3.Store();
    parser.parse(source, (error, quad) => {
        store.addQuad(quad);
    });

    return store;
}

function N3QuadsToLanguageString(quads: Quad[]): LanguageString {
    // @ts-ignore
    return Object.fromEntries(quads.map(quad => [quad.object.language, quad.object.value]));
}

export default class implements CimAdapter {
    private readonly endpoint = "https://slovník.gov.cz/sparql";
    private idProvider: IdProvider;

    private async executeQuery(query: string) {
        const format = "text/plain";
        const url = this.endpoint
            + "?format=" + encodeURIComponent(format)
            + "&query=" + encodeURIComponent(query);
        const options = {"headers": {"Accept": format}};
        const response = await fetch(url, options);
        return await response.text();
    }

    constructor(idProvider: IdProvider) {
        this.idProvider = idProvider;
    }

    async search(searchString: string): Promise<PimClass[]> {
        const content = await this.executeQuery(createSearchQuery(searchString));
        const cimStore = await parseN3IntoStore(content);

        const result: PimClass[] = [];

        const cimClasses = cimStore.getQuads(null, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", null, null);
        for (const cimClass of cimClasses) {
            const cimId = cimClass.subject.id;
            const pimClass = this.createPimClass(cimId);

            // skos:prefLabel
            const prefLabel = cimStore.getQuads(cimId, "http://www.w3.org/2004/02/skos/core#prefLabel", null, null);
            pimClass.pimHumanLabel = {...pimClass.pimHumanLabel, ...N3QuadsToLanguageString(prefLabel)};

            // skos:definition
            const definition = cimStore.getQuads(cimId, "http://www.w3.org/2004/02/skos/core#definition", null, null);
            pimClass.pimHumanDescription = {...pimClass.pimHumanDescription, ...N3QuadsToLanguageString(definition)};

            result.push(pimClass);
        }

        return result;
    }

    async getClass(cimId: string): Promise<PimClass | null> {
        const pimId = this.idProvider.pimFromCim(cimId);
        return await this.executeQuery(classExistsQuery(cimId)) === "true" ? this.createPimClass(pimId) : null;
    }

    async getSurroundings(cimId: string): Promise<Store> {
        const content = await this.executeQuery(getSurroundingsQuery(cimId));
        const cimStore = await parseN3IntoStore(content);

        const pimStore: Store = {};

        const root = this.createPimClass(cimId, pimStore);

        // process isa
        const stream = cimStore.getQuads(cimId, "http://www.w3.org/2000/01/rdf-schema#subClassOf", null, null);
        const isaIds = stream.map(quad => this.createPimClass(quad.object.id, pimStore).id);
        root.pimIsa = [... new Set([...root.pimIsa, ...isaIds])];

        // skos:prefLabel
        const prefLabel = cimStore.getQuads(cimId, "http://www.w3.org/2004/02/skos/core#prefLabel", null, null);
        root.pimHumanLabel = {...root.pimHumanLabel, ...N3QuadsToLanguageString(prefLabel)};

        // skos:definition
        const definition = cimStore.getQuads(cimId, "http://www.w3.org/2004/02/skos/core#definition", null, null);
        root.pimHumanDescription = {...root.pimHumanDescription, ...N3QuadsToLanguageString(definition)};

        // forward and reverse associations
        const associations = cimStore.getQuads(null, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "__association", null);
        for (const association of associations) {
            const domain = cimStore.getQuads(association.subject.id, "http://www.w3.org/2000/01/rdf-schema#domain", null, null)[0].object.id;
            const range = cimStore.getQuads(association.subject.id, "http://www.w3.org/2000/01/rdf-schema#range", null, null)[0].object.id;

            const domainClass = this.createPimClass(domain, pimStore);
            const rangeClass = this.createPimClass(range, pimStore);

            const associationClass = this.createPimAssociation(association.subject.id, pimStore);
            associationClass.pimEnd = [{pimParticipant: domainClass.id}, {pimParticipant: rangeClass.id}];
        }

        return pimStore;
    }

    private createPimClass(cimId: string, store?: Store): PimClass {
        const pimId = this.idProvider.pimFromCim(cimId);
        const resource = store && store[cimId] ? store[pimId] : new PimClass(pimId);
        if (store) store[cimId] = resource;
        const pimClass = PimClass.as(resource);
        pimClass.pimInterpretation = cimId;
        return pimClass;
    }

    private createPimAssociation(cimId: string, store: Store): PimAssociation {
        const pimId = this.idProvider.pimFromCim(cimId);
        const pimAssociation = PimAssociation.as(store[pimId] = store[pimId] ?? new PimAssociation(pimId));
        pimAssociation.pimInterpretation = cimId;
        return pimAssociation;
    }
}
