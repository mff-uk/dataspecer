import { SourceCodeWriter, SourceCodeLanguageIdentifier } from "../writers/source-code-writer-model";
import { TypescriptWriter } from "../writers/typescript-writer";

export function tryGetKnownDictionaryPrefix(iri: string) {
    const knownPrefixes = {
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

    if (matches.length === 1) {
        //console.log(`Found match: ${iri}: ${matches[0]}`);
        return [knownPrefixes[matches[0]], iri.replace(matches[0], "")];
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
    return initialName
        .split(" ")
        .map(word => {
            return `${word.charAt(0).toUpperCase()}${word.substring(1).toLowerCase()}`;
        })
        .join("");
}

export function convertToKebabCase(initialName: string): string {
    return initialName
        .split(" ")
        .map(word => word.toLowerCase())
        .join("-");
}