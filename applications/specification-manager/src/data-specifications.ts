import {DataSpecification} from "@model-driven-data/core/data-specification/model";
import {DataSpecificationWithMetadata} from "@model-driven-data/backend-utils/interfaces/data-specification-with-metadata";
import {DataSpecificationWithStores} from "@model-driven-data/backend-utils/interfaces/data-specification-with-stores";

export type FullDataSpecification = DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores;

export interface DataSpecifications {
    [key: string]: FullDataSpecification;
}
