import { LOCAL_VISUAL_MODEL } from "../../model/known-models";
import { createDefaultVisualModel } from "../../visual-model";
import { createDefaultEntityModel } from "../../visual-model/entity-model/default-entity-model";
import { EntityModel } from "../../visual-model/entity-model/entity-model";

/**
 * Create and return empty visual model with given IRI as an identifier.
 */
export const createVisualModel = (iri: string) => {
    const internalModel = createDefaultEntityModel(LOCAL_VISUAL_MODEL, iri) as EntityModel;
    return createDefaultVisualModel(iri, internalModel);
};
