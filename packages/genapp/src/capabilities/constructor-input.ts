import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { Datasource } from "../application-config";

export type CapabilityConstructorInput = {
    dataStructure: DataPsmSchema;
    datasource: Datasource;
};
