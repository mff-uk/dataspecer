import { AggregateMetadata } from "../application-config";
import { Datasource } from "../engine/graph/datasource";

export type CapabilityConstructorInput = {
    capabilityLabel: string | undefined;
    dataStructureMetadata: AggregateMetadata;
    datasource: Datasource;
};
