import { Datasource } from "../application-config";

export type CapabilityConstructorInput = {
    rootStructureIri: string;
    rootLabel: string;
    datasource: Datasource;
};
