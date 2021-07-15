import * as jsonld from "jsonld";
import {RdfQuad} from "../../../core/adapter/rdf/rdf-adapter-api";

export async function parseRdfQuadsWithJsonLd(content: string): Promise<RdfQuad[]> {
  const contentAsJson = JSON.parse(content) as jsonld.JsonLdDocument;
  const options = {
    "documentLoader": async (url) => {
      // // @ts-ignore
      const loader = jsonld.documentLoaders.node();
      // Encode the URL to allow for national characters.
      return await loader(encodeURI(url));
    }
  };
  // The dataset model match with the RdfQuad array.
  return (await jsonld.toRDF(contentAsJson, options)) as RdfQuad[];
}
