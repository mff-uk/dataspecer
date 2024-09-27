import { EntityModel } from "@dataspecer/core-v2";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { sourceModelOfEntity } from "../../util/model-utils";
import { removeSelectionFromSemanticModel } from "../selection-actions/remove-selection-from-semantic-model";
import { changeSelectionVisibility } from "../selection-actions/change-selection-visibility";
import { isSemanticModelClass, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";


export function changeSemanticModelVisibility(modelIdentifier: string,
                                        graph: ModelGraphContextType,
                                        classes: ClassesContextType | null,
                                        visibility: boolean) {
    const semanticModel: EntityModel | undefined = Object.entries(graph.models).find(([identifier, model]) => identifier === modelIdentifier)?.[1]
    if(semanticModel === undefined) {
        return;
    }

    const selection = getSelectionForSemanticModel(semanticModel);
    changeSelectionVisibility(selection, graph, classes, visibility);
}

// The following methods will be defined elsewhere

/**
 *
 * @returns All class and class usages within model
 */
function getSelectionForSemanticModel(semanticModel: EntityModel): string[] {
    const extension: string[] = [];
    const classesAndUsages = getClassesAndClassUsages(semanticModel);
    classesAndUsages.forEach(entity => {
        extension.push(entity.id);
    });

    return extension;
}


/**
 *
 * @returns Class and Class usages of the given moddel
 */
export const getClassesAndClassUsages = (model: EntityModel): (SemanticModelClass | SemanticModelClassUsage)[] => {
    return Object.values(model.getEntities()).filter((entity) => isSemanticModelClass(entity) || isSemanticModelClassUsage(entity));
};