import { DataTypeURIs } from "@dataspecer/core-v2/semantic-model/datatypes";
import { CmePrimitiveType } from "../model/cme-primitive-type";
import { configuration } from "../../../application";
import { UnknownCmeSemanticModel } from "../cme-well-known";

const PRIMITIVE_TYPES: CmePrimitiveType[] = [];

const RDFS_LITERAL_IRI = "http://www.w3.org/2000/01/rdf-schema#Literal";

let RDFS_LITERAL: CmePrimitiveType | null = null;

(function initializePrimitiveTypes() {
  const prefixes = configuration().prefixes;
  DataTypeURIs.forEach(iri => {
    PRIMITIVE_TYPES.push({
      identifier: iri,
      iri,
      model: UnknownCmeSemanticModel.identifier,
      name: { "": iriToName(prefixes, iri) },
    });
  });
  // Prevent changes.
  Object.freeze(PRIMITIVE_TYPES);
  // Select rdfs:Literal
  RDFS_LITERAL = PRIMITIVE_TYPES.find(item => item.iri === RDFS_LITERAL_IRI)!;
})();

function iriToName(prefixes: { [iri: string]: string }, iri: string): string {
  if (iri === "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/text") {
    // https://github.com/mff-uk/dataspecer/issues/1078
    return "Text";
  }
  for (const [prefix, shortcut] of Object.entries(prefixes)) {
    if (iri.startsWith(prefix)) {
      return shortcut + ":" + iri.substring(prefix.length);
    }
  }
  return iri;
};

export const listCmePrimitiveTypes = (): CmePrimitiveType[] => {
  return PRIMITIVE_TYPES;
}

export const cmeRdfsLiteral = (): CmePrimitiveType => {
  return RDFS_LITERAL!;
};
