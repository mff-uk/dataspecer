export const XsdSimpleTypeURIs = [
    "http://www.w3.org/2001/XMLSchema#string",
    "http://www.w3.org/2001/XMLSchema#boolean",
    "http://www.w3.org/2001/XMLSchema#decimal",
    "http://www.w3.org/2001/XMLSchema#integer",
    "http://www.w3.org/2001/XMLSchema#float",
    "http://www.w3.org/2001/XMLSchema#double",
    "http://www.w3.org/2001/XMLSchema#date",
    "http://www.w3.org/2001/XMLSchema#gYear",
    "http://www.w3.org/2001/XMLSchema#time",
    "http://www.w3.org/2001/XMLSchema#dateTime",
    "http://www.w3.org/2001/XMLSchema#duration",
    "http://www.w3.org/2001/XMLSchema#base64Binary",
    "http://www.w3.org/2001/XMLSchema#hexBinary",
    "http://www.w3.org/2001/XMLSchema#anyURI",
    "http://www.w3.org/2001/XMLSchema#QName",
];

export const RdfTypeURIs = [
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
];

export const RdfsTypeURIs = [
    "http://www.w3.org/2000/01/rdf-schema#Literal",
];

export const DataTypeURIs = [
    ...XsdSimpleTypeURIs,
    ...RdfTypeURIs,
    ...RdfsTypeURIs,
    // other data types
];
