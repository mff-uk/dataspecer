import * as N3 from "n3";
import {Quad} from "n3";
import {PimClass} from "../../../pim/pim-class";
import {LanguageString} from "../../../platform-model-api";
import {PimAssociation} from "../../../pim/pim-association";
import {CimAdapter} from "../cim-adapters-api";
import {Store} from "../../../platform-model-store";
import IdProvider from "../../../IdProvider";
import {PimBase} from "../../../pim/pim-base";
import jsStringEscape from "js-string-escape";
import search from "./search.sparql"
import getClass from "./get-class.sparql"
import {PimAttribute} from "../../../pim/pim-attribute";
//import fetch from "../../../../rdf/rdf-fetch"
import getSurroundingsAttributes from "./get-surroundings-attributes.sparql"
import getSurroundingsInwardsRelations from "./get-surroundings-inwards-relations.sparql"
import getSurroundingsOutwardsRelations from "./get-surroundings-outwards-relations.sparql"
import getSurroundingsParent from "./get-surroundings-parent.sparql"

const getSurroundings = [getSurroundingsAttributes, getSurroundingsInwardsRelations, getSurroundingsOutwardsRelations, getSurroundingsParent];

export interface SlovnikPimMetadata {
    glossary?: SlovnikGlossary;
}

export interface SlovnikGlossary {
    type: string;
}

export class LegislativniSlovnikGlossary implements SlovnikGlossary {
    type: string;
    number: number;
    year: number;

    static is(glossary: SlovnikGlossary): glossary is LegislativniSlovnikGlossary {
        return glossary?.type === "legislativní";
    }
}

const searchQuery = (searchString: string) => search.replace("%QUERY%", `"${jsStringEscape(searchString)}"`);
const getClassQuery = (id: string) => getClass.replace("%NODE%", `<${id}>`);
const getSurroundingsQueries = (id: string) => getSurroundings.map(q => q.replace(/%NODE%/g, `<${id}>`));

async function parseN3IntoStore(source: string, useStore: N3.Store = undefined): Promise<N3.Store> {
    let parser = new N3.Parser();
    let store = useStore || new N3.Store();
    parser.parse(source, (error, quad) => {
        if (error !== null) {
            throw error;
        } else if (quad === null) {
            return store;
        } else {
            store.addQuad(quad);
        }
    });

    return store;
}

function N3QuadsToLanguageString(quads: Quad[]): LanguageString {
    // @ts-ignore
    return Object.fromEntries(quads.map(quad => [quad.object.language, quad.object.value]));
}

const RDF = {
    type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
}
const RDFS = {
    subClassOf: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
    domain: "http://www.w3.org/2000/01/rdf-schema#domain",
    range: "http://www.w3.org/2000/01/rdf-schema#range",
}
const POJEM = {
    typObjektu: "https://slovník.gov.cz/základní/pojem/typ-objektu",
    typVlastnosti: "https://slovník.gov.cz/základní/pojem/typ-vlastnosti",
    typVztahu: "https://slovník.gov.cz/základní/pojem/typ-vztahu",
}
const SKOS = {
    prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
    definition: "http://www.w3.org/2004/02/skos/core#definition",
    inScheme: "http://www.w3.org/2004/02/skos/core#inScheme",
}

const IRI_REGEXP = new RegExp("^https://slovník\.gov\.cz/");

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

    async search(searchString: string): Promise<(PimClass&SlovnikPimMetadata)[]> {
        const content = await this.executeQuery(searchQuery(searchString));
        const cimStore = await parseN3IntoStore(content);

        const classQuads = cimStore.getQuads(null, RDF.type, POJEM.typObjektu, null);

        const sorted = classQuads.map(quad => ({
            sort: Number(cimStore.getQuads(quad.subject, "__order", null, null)[0].object.value),
            cls: this.parseClassFromN3StoreToStore(cimStore, quad.subject.id)
        })).sort((a, b) => a.sort - b.sort).map(p => p.cls);

        if (IRI_REGEXP.test(searchString)) {
            const classById = await this.getClass(searchString);
            if (classById) return [classById, ...sorted];
        }

        return sorted;
    }

    async getClass(cimId: string): Promise<PimClass | null> {
        const content = await this.executeQuery(getClassQuery(cimId));
        const cimStore = await parseN3IntoStore(content);
        if (cimStore.size) {
            return this.parseClassFromN3StoreToStore(cimStore, cimId);
        } else {
            return null;
        }
    }

    async getSurroundings(cimId: string): Promise<Store> {
        let cimStore = undefined;
        for (const query of getSurroundingsQueries(cimId)) {
            const content = await this.executeQuery(query);
            cimStore = await parseN3IntoStore(content, cimStore);
        }

        const pimStore: Store = {};

        const root = this.parseClassFromN3StoreToStore(cimStore, cimId, pimStore);

        // process parents (isa)
        const stream = cimStore.getQuads(cimId, RDFS.subClassOf, null, null);
        const isaIds = stream.map(quad => this.createPimClass(quad.object.id, pimStore).id);
        root.pimIsa = [... new Set([...root.pimIsa, ...isaIds])];

        // forward and reverse associations
        const associations = cimStore.getQuads(null, RDF.type, POJEM.typVztahu, null);
        for (const {subject: association} of associations) {
            const domain = cimStore.getQuads(association, RDFS.domain, null, null)[0].object.id;
            const range = cimStore.getQuads(association, RDFS.range, null, null)[0].object.id;

            const domainClass = this.parseClassFromN3StoreToStore(cimStore, domain, pimStore);
            const rangeClass = this.parseClassFromN3StoreToStore(cimStore, range, pimStore);

            const associationClass = this.parseAssociationFromN3StoreToStore(cimStore, association.id, pimStore);
            associationClass.pimEnd = [{pimParticipant: domainClass.id}, {pimParticipant: rangeClass.id}];
        }

        // attributes
        const attributes = cimStore.getQuads(null, RDF.type, POJEM.typVlastnosti, null);
        for (const {subject: attribute} of attributes) {
            // checking if domain corresponds to the node is ignored
            const pimAttribute = this.createPimAttribute(attribute.id, pimStore);
            this.parsePropertiesFromN3(cimStore, attribute.id, pimAttribute);
            pimAttribute.pimHasClass = root.id;
        }

        return pimStore;
    }

    private parsePropertiesFromN3(inputStore: N3.Store, inputId: string, outputPim: PimBase & SlovnikPimMetadata) {
        // skos:prefLabel
        const prefLabel = inputStore.getQuads(inputId, SKOS.prefLabel, null, null);
        outputPim.pimHumanLabel = {...outputPim.pimHumanLabel, ...N3QuadsToLanguageString(prefLabel)};

        // skos:definition
        const definition = inputStore.getQuads(inputId, SKOS.definition, null, null);
        outputPim.pimHumanDescription = {...outputPim.pimHumanDescription, ...N3QuadsToLanguageString(definition)};

        // glossary metadata
        if (inputStore) {
            const glossary_quads = inputStore.getQuads(inputId, SKOS.inScheme, null, null);
            for (const quad of glossary_quads) { // Only slovník.gov.cz is accepted
                const match = glossary_quads[0].object.id.match(/^https:\/\/slovník.gov.cz\/([^\/]+)/);
                if (!match) continue;
                const glossary = outputPim.glossary = {type: match[1]}

                if (LegislativniSlovnikGlossary.is(glossary)) {
                    const [, number, year] = glossary_quads[0].object.id.match(/^https:\/\/slovník.gov.cz\/legislativní\/sbírka\/([^\/]+)\/([^\/]+)/);
                    glossary.number = Number(number);
                    glossary.year = Number(year);
                }
            }
        }
    }

    private createPimClass(cimId: string, store?: Store): PimClass {
        const pimId = this.idProvider.pimFromCim(cimId);
        const resource = store && store[pimId] ? store[pimId] : new PimClass(pimId);
        if (store) store[pimId] = resource;
        const pimClass = PimClass.as(resource);
        pimClass.pimInterpretation = cimId;
        return pimClass;
    }

    private parseClassFromN3StoreToStore(inputStore: N3.Store, entityId: string, outputStore?: Store): PimClass {
        const cls = this.createPimClass(entityId, outputStore);
        this.parsePropertiesFromN3(inputStore, entityId, cls);
        return cls;
    }

    private createPimAssociation(cimId: string, store: Store): PimAssociation {
        const pimId = this.idProvider.pimFromCim(cimId);
        const pimAssociation = PimAssociation.as(store[pimId] = store[pimId] ?? new PimAssociation(pimId));
        pimAssociation.pimInterpretation = cimId;
        return pimAssociation;
    }

    private parseAssociationFromN3StoreToStore(inputStore: N3.Store, entityId: string, outputStore?: Store): PimAssociation {
        const association = this.createPimAssociation(entityId, outputStore);
        this.parsePropertiesFromN3(inputStore, entityId, association);
        return association;
    }

    private createPimAttribute(cimId: string, store?: Store): PimAttribute {
        const pimId = this.idProvider.pimFromCim(cimId);
        const resource = store && store[pimId] ? store[pimId] : new PimAttribute(pimId);
        if (store) store[pimId] = resource;
        const pimAttribute = PimAttribute.as(resource);
        pimAttribute.pimInterpretation = cimId;
        return pimAttribute;
    }
}
