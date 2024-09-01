import { AggregateMetadata } from "../application-config";
import { Datasource } from "../engine/graph/datasource";

export type CapabilityConstructorInput = {
    dataStructureMetadata: AggregateMetadata;
    datasource: Datasource;
};
