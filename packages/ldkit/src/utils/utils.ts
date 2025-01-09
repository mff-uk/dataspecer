import { OFN } from "@dataspecer/core/well-known/ofn";
import { SourceCodeWriter, SourceCodeLanguageIdentifier } from "../writers/source-code-writer-model";
import { TypescriptWriter } from "../writers/typescript-writer";

export const wellKnownTypesMap: { [k: string]: any } = {
    [OFN.boolean]: "xsd.boolean",
    [OFN.date]: "xsd.date",
    [OFN.dateTime]: "xsd.dateTime",
    [OFN.integer]: "xsd.integer",
    [OFN.decimal]: "xsd.decimal",
    [OFN.url]: "xsd.anyURI",
    [OFN.string]: "xsd.string",
    [OFN.text]: "rdf.langString",
    [OFN.rdfLangString]: "rdf.langString"
};

function tryGetKnownDictionaryPrefix(iri: string) {
    const knownPrefixes: { [key: string]: string } = {
        "http://dbpedia.org/ontology/": "dbo",
        "http://purl.org/dc/elements/1.1/": "dc",
        "http://purl.org/dc/terms/": "dcterms",
        "http://xmlns.com/foaf/0.1/": "foaf",
        "http://purl.org/goodrelations/v1#": "gr",
        "http://ldkit/": "ldkit",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#": "rdf",
        "http://www.w3.org/2000/01/rdf-schema#": "rdfs",
        "http://schema.org/": "schema",
        "http://rdfs.org/sioc/ns#": "sioc",
        "http://www.w3.org/2004/02/skos/core#": "skos",
        "http://www.w3.org/2001/XMLSchema#": "xsd",
        "http://www.w3.org/ns/dcat#": "dcat"
    } as const;

    const matches = Object.keys(knownPrefixes).filter(key => iri.startsWith(key));

    if (matches.length === 1 && matches[0] !== undefined) {
        //console.log(`Found match: ${iri}: ${matches[0]}`);
        if (knownPrefixes[matches[0]] === undefined) {
            throw new Error();
        }

        const knownPrefix: string = knownPrefixes[matches[0]] as string;
        const commonIri: string = iri.replace(matches[0], "");

        return [knownPrefix, commonIri];
    }

    if (!matches.length) {
        console.log(`Didn't find match for ${iri}`);
        return null;
    }

    throw Error(`Found multiple matches: ${matches.length}`);
}

export function getSupportedWriter(sourceCodeLanguageIdentifier: SourceCodeLanguageIdentifier): SourceCodeWriter {
    const supportedWriters = {
        "ts": new TypescriptWriter()
    };

    return supportedWriters[sourceCodeLanguageIdentifier] ?? supportedWriters["ts"];
}

export function convertToPascalCase(initialName: string): string {
    const result = initialName
        .replaceAll("-", " ")
        .replace(
            /(\w)(\w*)/g,
            (_, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
        )
        .replaceAll(" ", "");

    return result;
}

export function convertToKebabCase(initialName: string): string {
    return initialName
        .split(" ")
        .map(word => word.toLowerCase())
        .join("-");
}