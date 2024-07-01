import { RdfTypeURIs, XsdSimpleTypeURIs } from "./datatypes";

export const isXsdSimpleDataType = (uri: string) => {
    return XsdSimpleTypeURIs.includes(uri);
};

export const isRdfDataType = (uri: string) => {
    return RdfTypeURIs.includes(uri);
};

export const dataTypeUriToName = (uri: string) => {
    if (isXsdSimpleDataType(uri)) {
        return "xsd:" + uri.split("#").at(1)!;
    }
    if (isRdfDataType(uri)) {
        return "rdf:" + uri.split("#").at(1)!;
    }
    return null;
};

export const isDataType = (uri: string | null): uri is string => {
    if (!uri) {
        return false;
    }
    return isXsdSimpleDataType(uri) || isRdfDataType(uri); // || isOtherDataType(uri)...
};
