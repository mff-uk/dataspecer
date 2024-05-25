import { XsdSimpleTypeURIs } from "./datatypes";

export const isXsdSimpleDataType = (uri: string) => {
    return XsdSimpleTypeURIs.includes(uri);
};

export const xdsSimpleTypeUriToName = (uri: string) => {
    if (!isXsdSimpleDataType(uri)) {
        return null;
    }
    return uri.split("#").at(1)!;
};

export const dataTypeUriToName = (uri: string) => {
    if (isXsdSimpleDataType(uri)) {
        return uri.split("#").at(1)!;
    }
    return null;
};

export const isDataType = (uri: string | null): uri is string => {
    if (!uri) {
        return false;
    }
    return isXsdSimpleDataType(uri); // || isOtherDataType(uri)...
};
