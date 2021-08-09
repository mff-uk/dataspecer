import {HttpFetch} from "../../fetch/fetch-api";
import {parseRdfQuadsWithN3} from "../n3/n3-adapter";
import {RdfQuad} from "../rdf-api";

export async function fetchRdfQuadsBySparqlConstruct(
  httpFetch: HttpFetch, endpoint: string, query: string,
): Promise<RdfQuad[]> {
  const format = "text/plain";
  const url = createUrl(endpoint, query, format);
  const headers = {"Accept": format};
  const response = await httpFetch(url, {"headers": headers});
  const content = await response.text();
  return await parseRdfQuadsWithN3(content);
}

function createUrl(endpoint: string, query: string, format: string): string {
  return endpoint
    + "?format=" + encodeURIComponent(format)
    + "&query=" + encodeURIComponent(query);
}
