import { DataSpecificationArtefact, DataSpecification } from "@dataspecer/core/data-specification/model";
import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { prepareArtifacts } from "./artifacts";
import { prepareDataSpecification } from "./data-specification";
import { prepareFunctions } from "./functions";

/**
 * Function that adds or modifies the mustache view based on the package context.
 */
export type mustacheViewReducer = (view: object, context: PackageContext) => object;

export interface PackageContext {
    context: ArtefactGeneratorContext;
    artefact: DataSpecificationArtefact;
    specification: DataSpecification;
}

/**
 * Default mustache view reducers
 */
export const defaultMustacheViewReducers: mustacheViewReducer[] = [
    prepareFunctions,
    prepareArtifacts,
    prepareDataSpecification,
];

/**
 * Returns the mustache view for the template
 */
export function getMustacheView(context: PackageContext): object {
    return defaultMustacheViewReducers.reduce((view, reducer) => reducer(view, context), {});
}