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

export const RDF = {
  type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
};

export const RDFS = {
  subClassOf: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
  domain: "http://www.w3.org/2000/01/rdf-schema#domain",
  range: "http://www.w3.org/2000/01/rdf-schema#range",
  label: "http://www.w3.org/2000/01/rdf-schema#label",
};

export const SCHEMA = {
  description: "http://schema.org/description",
}


export const WIKIDATA_SPARQL_FREE_VAR_PREFIX = "http://query.wikidata.org/bigdata/namespace/wdq/"

export const WIKIDATA_ENTITY_PREFIX = "http://www.wikidata.org/entity/";