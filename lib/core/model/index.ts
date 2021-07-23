import {CoreResource} from "./core-resource";

export * from "./psm";
export * from "./pim";
export * from "./core-resource";

export type CoreResourceMap = { [iri: string]: CoreResource };
