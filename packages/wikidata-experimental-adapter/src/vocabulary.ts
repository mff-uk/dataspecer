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
