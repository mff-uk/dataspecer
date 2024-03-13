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
  rdfLangString: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
};

export const OFN_LABELS = {
  [OFN.boolean]: {
    cs: "Booleovská hodnota - Ano či ne",
    en: "Boolean",
  },
  [OFN.date]: {
    cs: "Datum",
    en: "Date",
  },
  [OFN.time]: {
    cs: "Čas",
    en: "Time",
  },
  [OFN.dateTime]: {
    cs: "Datum a čas",
    en: "Date and time",
  },
  [OFN.integer]: {
    cs: "Celé číslo",
    en: "Integer",
  },
  [OFN.decimal]: {
    cs: "Desetinné číslo",
    en: "Decimal number",
  },
  [OFN.url]: {
    cs: "URI, IRI, URL",
    en: "URI, IRI, URL",
  },
  [OFN.string]: {
    cs: "Řetězec",
    en: "String",
  },
  [OFN.text]: {
    cs: "Text",
    en: "Text",
  },
  [OFN.rdfLangString]: {
    "cs": "Řetězec anotovaný jazykem",
    "en": "Language tagged string"
  }
};
