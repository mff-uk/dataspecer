import * as N3 from "n3";
import {PimClass} from "../../../pim/pim-class";
import {LanguageString} from "../../../platform-model-api";
import {Quad} from "n3";
import {PimAssociation} from "../../../pim/pim-association";
import {CimAdapter} from "../cim-adapters-api";
import {Store} from "../../../platform-model-store";
import IdProvider from "../../../IdProvider";
import {PimBase} from "../../../pim/pim-base";
import fetch from "./../../../../rdf/rdf-fetch";

// todo fix injection
function searchQuery(searchString: string) {
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

function getClassQuery(id: string) {
  return `PREFIX z: <https://slovník.gov.cz/základní/pojem/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
CONSTRUCT WHERE { <${id}> a z:typ-objektu ; skos:prefLabel ?label ; skos:definition ?definition . }`;
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
        skos:prefLabel ?associationLabel ;
        a <__association> .
        
    ?association_node skos:prefLabel ?association_node_label .

    ?reverse_association rdfs:range ?node ;
        rdfs:domain ?reverse_association_node ;
        skos:prefLabel ?reverse_associationLabel ;  
        a <__association> .
        
    ?reverse_association_node skos:prefLabel ?reverse_association_node_label .

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
            rdfs:range ?association_node ;
            skos:prefLabel ?associationLabel .
            
        ?association_node skos:prefLabel ?association_node_label .
    } union
    {
        ?reverse_association rdfs:range ?node ;
            rdfs:domain ?reverse_association_node ;
            skos:prefLabel ?reverse_associationLabel .
            
        ?reverse_association_node skos:prefLabel ?reverse_association_node_label .
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
  const parser = new N3.Parser();
  const store = new N3.Store();
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
};
const RDFS = {
  subClassOf: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
  domain: "http://www.w3.org/2000/01/rdf-schema#domain",
  range: "http://www.w3.org/2000/01/rdf-schema#range",
};
const POJEM = {
  typObjektu: "https://slovník.gov.cz/základní/pojem/typ-objektu",
};
const SKOS = {
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
  definition: "http://www.w3.org/2004/02/skos/core#definition",
};

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

    async search(searchString: string): Promise<PimClass[]> {
      const content = await this.executeQuery(searchQuery(searchString));
      const cimStore = await parseN3IntoStore(content);

      const cimClasses = cimStore.getQuads(null, RDF.type, POJEM.typObjektu, null);
      const result = cimClasses.map(quad => this.parseClassFromN3StoreToStore(cimStore, quad.subject.id));

      if (IRI_REGEXP.test(searchString)) {
        const classById = await this.getClass(searchString);
        if (classById) return [classById, ...result];
      }

      return result;
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
      const content = await this.executeQuery(getSurroundingsQuery(cimId));
      const cimStore = await parseN3IntoStore(content);

      const pimStore: Store = {};

      const root = this.parseClassFromN3StoreToStore(cimStore, cimId, pimStore);

      // process isa
      const stream = cimStore.getQuads(cimId, RDFS.subClassOf, null, null);
      const isaIds = stream.map(quad => this.createPimClass(quad.object.id, pimStore).id);
      root.pimIsa = [... new Set([...root.pimIsa, ...isaIds])];

      // forward and reverse associations
      const associations = cimStore.getQuads(null, RDF.type, "__association", null);
      for (const association of associations) {
        const domain = cimStore.getQuads(association.subject.id, RDFS.domain, null, null)[0].object.id;
        const range = cimStore.getQuads(association.subject.id, RDFS.range, null, null)[0].object.id;

        const domainClass = this.parseClassFromN3StoreToStore(cimStore, domain, pimStore);
        const rangeClass = this.parseClassFromN3StoreToStore(cimStore, range, pimStore);

        const associationClass = this.parseAssociationFromN3StoreToStore(cimStore, association.subject.id, pimStore);
        associationClass.pimEnd = [{pimParticipant: domainClass.id}, {pimParticipant: rangeClass.id}];
      }

      return pimStore;
    }

    private parsePropertiesFromN3(inputStore: N3.Store, inputId: string, outputPim: PimBase) {
      // skos:prefLabel
      const prefLabel = inputStore.getQuads(inputId, SKOS.prefLabel, null, null);
      outputPim.pimHumanLabel = {...outputPim.pimHumanLabel, ...N3QuadsToLanguageString(prefLabel)};

      // skos:definition
      const definition = inputStore.getQuads(inputId, SKOS.definition, null, null);
      outputPim.pimHumanDescription = {...outputPim.pimHumanDescription, ...N3QuadsToLanguageString(definition)};
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
}
