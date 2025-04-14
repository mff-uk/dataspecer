import { RdfQuad } from "../../../core/adapter/rdf/index.ts";
import {RdfXmlParser} from "rdfxml-streaming-parser";

export function parseRdfXml(
    content: string
): Promise<RdfQuad[]> {
    const parser = new RdfXmlParser();

    return new Promise((resolve, reject) => {
        const quads: RdfQuad[] = [];
        parser.on('data', quad => quads.push(quad));
        parser.on('end', () => resolve(quads));
        parser.on('error', error => reject(error));
        parser.write(content);
        parser.end();
    });
}
