import { AggregateMetadata, Datasource } from "../application-config";

export type CapabilityConstructorInput = {
    dataStructureMetadata: AggregateMetadata;
    datasource: Datasource;
};
