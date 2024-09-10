import { AggregateMetadata } from "../application-config";
import { Datasource } from "../engine/graph/datasource";

export type CapabilityConstructorInput = {
    saveBasePath: string;
    dataStructureMetadata: AggregateMetadata;
    datasource: Datasource;
};
