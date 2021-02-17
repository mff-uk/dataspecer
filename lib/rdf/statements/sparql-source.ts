import {
  RdfEntity,
  RdfBaseValue,
  RdfBlankNode,
  RdfNamedNode,
} from "../rdf-api";
import {StatementSource} from "./statements-api";
import fetch from "../rdf-fetch";
import {parseN3AsProperties} from "../n3/n3-adapter";

export class SparqlSource implements StatementSource {

  readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  static async create(url: string): Promise<SparqlSource> {
    return new SparqlSource(url);
  }

  async fetch(entity: RdfEntity): Promise<void> {
    throw Error("Not implemented!");
  }

  async properties(entity: RdfEntity, predicate: string
  ): Promise<RdfBaseValue[]> {
    if (entity.id.startsWith("_")) {
      // There is no point in asking for blank nodes.
      return [];
    }
    const format = "text/plain";
    const url = createSparqlPropertyQueryUrl(
      this.endpoint, format, entity.id, predicate);
    const options = {"headers": {"Accept": format}};
    const response = await fetch(url, options);
    const content = await response.text();
    const properties = await parseN3AsProperties(content);
    const baseUrl = this.endpoint + ":" + entity.id;
    return Promise.resolve(properties.map(item => {
      // Sanitize blank nodes.
      if (item.object.isBlankNode()) {
        return new RdfBlankNode(item.object.id + ":" + baseUrl);
      }
      return item.object;
    }));
  }

  reverseProperties(
    predicate: string, iri: string
  ): Promise<(RdfBlankNode | RdfNamedNode)[]> {
    throw Error("Not implemented!");
  }

}

function createSparqlPropertyQueryUrl(
  endpoint: string, format: string, iri: string, predicate: string
): string {
  const query = `CONSTRUCT { <${iri}> <${predicate}> ?o } 
  WHERE { <${iri}> <${predicate}> ?o }`
  return endpoint + "?format=" + encodeURIComponent(format)
    + "&query=" + encodeURIComponent(query);
}
