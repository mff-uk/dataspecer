import { AggregateMetadata } from "../application-config.ts";
import { Datasource } from "../engine/graph/datasource.ts";

export type CapabilityConstructorInput = {
    capabilityLabel: string | undefined;
    structureModelMetadata: AggregateMetadata;
    datasource: Datasource;
};
