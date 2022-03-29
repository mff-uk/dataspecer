import {DataSpecification} from "@model-driven-data/core/data-specification/model";

/**
 * Extends data specification object with additional metadata such as creation
 * date, access rights, etc.
 */
export interface DataSpecificationWithMetadata extends DataSpecification {
    /**
     * Tags as a way of categorization
     */
    tags: string[],
}


