
const vocabulary : [string, string][] = [
  ["http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdf"],
  ["http://www.w3.org/2000/01/rdf-schema#", "rdfs"],
  ["http://purl.org/dc/terms/", "dct"],
  ["https://w3id.org/dsv#", "dsv"],
  ["http://www.w3.org/2002/07/owl#", "owl"],
  ["http://www.w3.org/2004/02/skos/core#", "skos"],
  ["http://www.w3.org/ns/dcat#", "dcat"],
];

/**
 * Given IRI return a prefix or null when no prefix is found.
 */
export const prefixForIri = (iri: string | null) : string | null => {
  for (const [prefix, shortcut] of vocabulary) {
    if (iri?.startsWith(prefix)) {
      return shortcut;
    }
  }
  return null;
};

/**
 * Given an absolute URL replace the absolute part with a prefix.
 * If there is no prefix match, returns the original.
 */
export const usePrefixForIri = (iri: string | null) : string | null => {
  for (const [prefix, shortcut] of vocabulary) {
    if (iri?.startsWith(prefix)) {
      return shortcut + ":" + iri.substring(prefix.length);
    }
  }
  return iri;
}


