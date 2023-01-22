import { HttpFetch } from "../../fetch/fetch-api";
import { RdfQuad } from "../../../core/adapter/rdf";
import { parseRdfQuadsWithJsonLd } from "../jsonld/jsonld-adapter";
import { parseRdfQuadsWithN3 } from "../n3/n3-adapter";
import {parseRdfXml} from "../xml/rdfxml-adapter";

enum MimeType {
  JsonLd = "application/ld+json",
  NQuads = "application/n-quads",
  Turtle = "text/turtle",
  TriG = "application/trig",
  NTriples = "application/n-triples",
  RdfXML = "application/rdf+xml",
}

export async function fetchRdfQuads(
  httpFetch: HttpFetch,
  url: string,
  asMimeType?: string,
): Promise<RdfQuad[]> {
  const options = {
    headers: {
      Accept: supportedTypes().join(","),
    },
  };
  const response = await httpFetch(url, options);
  const contentType = getContentType(response);
  switch (asMimeType ?? contentType) {
    case MimeType.JsonLd:
      return await parseRdfQuadsWithJsonLd(await response.text());
    case MimeType.NQuads:
    case MimeType.Turtle:
    case MimeType.TriG:
    case MimeType.NTriples:
      return await parseRdfQuadsWithN3(await response.text());
    case MimeType.RdfXML:
      return await parseRdfXml(await response.text());
    default:
      throw new Error(`Unsupported format '${contentType}'`);
  }
}

function supportedTypes() {
  return [
    MimeType.JsonLd,
    MimeType.NQuads,
    MimeType.Turtle,
    MimeType.TriG,
    MimeType.NTriples,
    MimeType.RdfXML,
  ];
}

function getContentType(response): string {
  if (!response.headers.has("content-type")) {
    throw Error("Missing 'content-type' header.");
  }
  const value = response.headers.get("content-type").toLowerCase();
  const index = value.indexOf(";");
  return index === -1 ? value : value.substr(0, index);
}
