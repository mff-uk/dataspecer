import { LOCAL_VISUAL_MODEL } from "../../model/known-models";
import { createDefaultVisualModelFactory } from "../../visual-model";
import { createDefaultEntityModel } from "../../visual-model/entity-model/default-entity-model";

const factory = createDefaultVisualModelFactory();

/**
 * Create and return empty visual model with given IRI as an identifier.
 */
export const createVisualModel = (iri: string) => {
    const internalModel = createDefaultEntityModel(LOCAL_VISUAL_MODEL, iri);
    return factory.createWritableVisualModelSync(internalModel);;
};
