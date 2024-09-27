import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { sourceModelOfEntity } from "../../util/model-utils";


/**
     * Removes the given selection from the semantic models.
     * @param selection
     * @returns Removed entities, i.e. the entities which were part of some local model.
     */
export const removeSelectionFromSemanticModel = (selection: string[], graph: ModelGraphContextType, classes: ClassesContextType | null): string[] => {
    const correctlyRemoved: string[] = [];

    selection.forEach(selectedEntityId => {
        const model = sourceModelOfEntity(selectedEntityId, [...graph.models.values()]);
        if(model !== undefined && model instanceof InMemorySemanticModel) {
            // Calling Another action
            // TODO: Or maybe delete all at once. Is there even way to delete all the entities at once?
            deleteEntityFromModel(selectedEntityId, model);
            correctlyRemoved.push(selectedEntityId);
        }
    });

    return correctlyRemoved;
};