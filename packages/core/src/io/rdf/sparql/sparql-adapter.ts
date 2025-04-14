import { HttpFetch } from "../../fetch/fetch-api.ts";
import { parseRdfQuadsWithN3 } from "../n3/n3-adapter.ts";
import { RdfQuad } from "../rdf-api.ts";

export async function fetchRdfQuadsBySparqlConstruct(
  httpFetch: HttpFetch,
  endpoint: string,
  query: string
): Promise<RdfQuad[]> {
  const format = "text/plain";
  const url = createSparqlQueryUrl(endpoint, query, format);
  const headers = { Accept: format };
  const response = await httpFetch(url, { headers: headers });
  const content = await response.text();
  return await parseRdfQuadsWithN3(content);
}

export function createSparqlQueryUrl(
  endpoint: string,
  query: string,
  format: string
): string {
  return (
    endpoint +
    "?format=" +
    encodeURIComponent(format) +
    "&query=" +
    encodeURIComponent(query)
  );
}
