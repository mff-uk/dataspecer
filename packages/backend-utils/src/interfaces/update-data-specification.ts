import {DataSpecification} from "@model-driven-data/core/data-specification/model";
import {DataSpecificationWithMetadata} from "./data-specification-with-metadata";

/**
 * Data type of update that is sent to the backend in order to update a data specification.
 */
export type UpdateDataSpecification =  Partial<Pick<
    DataSpecification & DataSpecificationWithMetadata,
    "importsDataSpecifications" | "tags"
    >>;
