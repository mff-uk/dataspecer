import {RdfEntity, RdfBaseValue, RdfBlankNode} from "../rdf-api";
import {StatementSource} from "./statements-api";
//import fetch from "../rdf-fetch";
import {parseN3AsProperties} from "../n3/n3-adapter";

export class SparqlSource implements StatementSource {

  readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  static async create(url: string): Promise<SparqlSource> {
    return new SparqlSource(url);
  }

  async properties(entity: RdfEntity, predicate: string,
  ): Promise<RdfBaseValue[]> {
    if (entity.id.startsWith("_")) {
      // There is no point in asking for blank nodes.
      return [];
    }
    const query = createSparqlProperty(entity.id, predicate);
    const baseUrl = this.endpoint + ":" + entity.id;
    return await this.executeSparqlConstruct(query, baseUrl);
  }

  async executeSparqlConstruct(
    query: string, baseUrl: string,
  ): Promise<RdfBaseValue[]> {
    const format = "text/plain";
    const url = this.endpoint
      + "?format=" + encodeURIComponent(format)
      + "&query=" + encodeURIComponent(query);
    const options = {"headers": {"Accept": format}};
    const response = await fetch(url, options);
    const content = await response.text();
    const properties = await parseN3AsProperties(content);
    return Promise.resolve(properties.map(item => {
      if (item.object.isBlankNode()) {
        return new RdfBlankNode(item.object.id + ":" + baseUrl);
      }
      return item.object;
    }));
  }

  async reverseProperties(
    predicate: string, entity: RdfEntity,
  ): Promise<RdfBaseValue[]> {
    if (entity.id.startsWith("_")) {
      // There is no point in asking for blank nodes.
      return [];
    }
    const query = createSparqlReverseProperty(entity.id, predicate);
    const baseUrl = this.endpoint + ":" + entity.id;
    return await this.executeSparqlConstruct(query, baseUrl);
  }

}

function createSparqlProperty(iri: string, predicate: string): string {
  return `CONSTRUCT { <${iri}> <http://localhost/value> ?o } 
  WHERE { <${iri}> <${predicate}> ?o }`;
}

function createSparqlReverseProperty(iri: string, predicate: string): string {
  return `CONSTRUCT { <${iri}> <http://localhost/value> ?s }
  WHERE { ?s <${predicate}> <${iri}> }`;
}