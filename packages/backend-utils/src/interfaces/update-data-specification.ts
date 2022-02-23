import {DataSpecification} from "@model-driven-data/core/data-specification/model";

/**
 * Data type of update that is sent to the backend in order to update a data specification.
 */
export type UpdateDataSpecification =  Partial<Pick<DataSpecification, "importsDataSpecifications">>;
