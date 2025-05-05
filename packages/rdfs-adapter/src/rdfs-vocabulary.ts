export const RDF = {
  type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  property: "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
  langString: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
};

export const RDFS = {
  subClassOf: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
  subPropertyOf: "http://www.w3.org/2000/01/rdf-schema#subPropertyOf",
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
  dateTime: XSD_PREFIX + "dateTime",
  dateTimeStamp: XSD_PREFIX + "dateTimeStamp",
  anyURI: XSD_PREFIX + "anyURI",
};
