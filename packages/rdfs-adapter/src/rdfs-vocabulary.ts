export const RDF = {
  type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  property: "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
  langString: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
};

const OFN_TYPE_PREFIX =
    "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/";

export const OFN = {
  boolean: OFN_TYPE_PREFIX + "boolean",
  date: OFN_TYPE_PREFIX + "datum",
  time: OFN_TYPE_PREFIX + "čas",
  dateTime: OFN_TYPE_PREFIX + "datum-a-čas",
  integer: OFN_TYPE_PREFIX + "celé-číslo",
  decimal: OFN_TYPE_PREFIX + "desetinné-číslo",
  url: OFN_TYPE_PREFIX + "url",
  string: OFN_TYPE_PREFIX + "řetězec",
  text: OFN_TYPE_PREFIX + "text",
};

export const RDFS = {
  subClassOf: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
  domain: "http://www.w3.org/2000/01/rdf-schema#domain",
  range: "http://www.w3.org/2000/01/rdf-schema#range",
  Class: "http://www.w3.org/2000/01/rdf-schema#Class",
  Literal: "http://www.w3.org/2000/01/rdf-schema#Literal",
  Resource: "http://www.w3.org/2000/01/rdf-schema#Resource",
};

export const POJEM = {
  typObjektu: "https://slovník.gov.cz/základní/pojem/typ-objektu",
  typVlastnosti: "https://slovník.gov.cz/základní/pojem/typ-vlastnosti",
  typVztahu: "https://slovník.gov.cz/základní/pojem/typ-vztahu",
};

export const SCHEMAORG = {
  domainIncludes: "https://schema.org/domainIncludes",
  rangeIncludes: "https://schema.org/rangeIncludes",

  Boolean: "https://schema.org/Boolean",
  Date: "https://schema.org/Date",
  DateTime: "https://schema.org/DateTime",
  Number: "https://schema.org/Number",
  Text: "https://schema.org/Text",
  Time: "https://schema.org/Time",
}

export const SKOS = {
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
  definition: "http://www.w3.org/2004/02/skos/core#definition",
  inScheme: "http://www.w3.org/2004/02/skos/core#inScheme",
};

export const OWL = {
  maxQualifiedCardinality:
    "http://www.w3.org/2002/07/owl#maxQualifiedCardinality",
  minQualifiedCardinality:
    "http://www.w3.org/2002/07/owl#minQualifiedCardinality",
  Thing: "http://www.w3.org/2002/07/owl#Thing",
  ObjectProperty: "http://www.w3.org/2002/07/owl#ObjectProperty",
  DatatypeProperty: "http://www.w3.org/2002/07/owl#DatatypeProperty",
  Class: "http://www.w3.org/2002/07/owl#Class",
};


export const XSD_PREFIX = "http://www.w3.org/2001/XMLSchema#";

export const XSD = {
  string: XSD_PREFIX + "string",
  decimal: XSD_PREFIX + "decimal",
  integer: XSD_PREFIX + "integer",
  boolean: XSD_PREFIX + "boolean",
  date: XSD_PREFIX + "date",
  time: XSD_PREFIX + "time",
  dateTimeStamp: XSD_PREFIX + "dateTimeStamp",
  anyURI: XSD_PREFIX + "anyURI",
};
