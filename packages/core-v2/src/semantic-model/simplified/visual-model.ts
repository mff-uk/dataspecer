import { LOCAL_VISUAL_MODEL } from "../../model/known-models.ts";
import { createDefaultVisualModelFactory } from "../../visual-model/index.ts";
import { createDefaultEntityModel } from "../../visual-model/entity-model/default-entity-model.ts";

const factory = createDefaultVisualModelFactory();

/**
 * Create and return empty visual model with given IRI as an identifier.
 */
export const createVisualModel = (iri: string) => {
    const internalModel = createDefaultEntityModel(LOCAL_VISUAL_MODEL, iri);
    return factory.createWritableVisualModelSync(internalModel);
};
