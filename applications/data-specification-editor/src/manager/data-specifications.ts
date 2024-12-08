import {DataSpecification} from "@dataspecer/core/data-specification/model";
import {DataSpecificationWithMetadata} from "@dataspecer/backend-utils/interfaces";
import {DataSpecificationWithStores} from "@dataspecer/backend-utils/interfaces";

export type FullDataSpecification = DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores;

export interface DataSpecifications {
    [key: string]: FullDataSpecification;
}
