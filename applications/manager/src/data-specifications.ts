import {DataSpecification} from "@dataspecer/core/data-specification/model";
import {DataSpecificationWithMetadata} from "@dataspecer/backend-utils/interfaces/data-specification-with-metadata";
import {DataSpecificationWithStores} from "@dataspecer/backend-utils/interfaces/data-specification-with-stores";

export type FullDataSpecification = DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores;

export interface DataSpecifications {
    [key: string]: FullDataSpecification;
}
