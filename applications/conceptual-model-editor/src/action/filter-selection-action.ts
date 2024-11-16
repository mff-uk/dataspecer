import { EntityModel } from "@dataspecer/core-v2";
import { sourceModelOfEntity } from "../util/model-utils";
import { isSemanticModelClassUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { isSemanticModelClass, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { ClassesContextEntities, isEntityInVisualModel, VisibilityFilter } from "./extend-selection-action";
import { ClassesContextType } from "../context/classes-context";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

/**
 * Type representing total filter on the type of entity.
 */
export type TotalFilter = "PROFILE" | "NORMAL";

type TotalFilterMethod = (selection: string[], filteredSelection: string[], contextEntities: ClassesContextEntities) => void;



/**
 *
 * @returns Filters {@link selection} based on {@link allowedClasses} and {@link visibilityFilter} and {@link semanticModelFilter}
 */
export function reductionTotalFilterAction(selection: string[],
                                allowedClasses: TotalFilter[],
                                visibilityFilter: VisibilityFilter,
                                semanticModelFilter: Record<string, boolean> | null,
                                graph: ModelGraphContextType,
                                notifications: UseNotificationServiceWriterType,
                                classesContext: ClassesContextType | null): string[] {
    if(classesContext === null) {
        return [];
    }

    let filteredSelection: string[] = [];
    const allowedClassesFilterMethods: TotalFilterMethod[] = [];
    const contextEntities: ClassesContextEntities = classesContext;

    allowedClasses.forEach(allowedClass => {
        switch(allowedClass) {
            case "NORMAL":
                allowedClassesFilterMethods.push(classFilter);
                break;
            case "PROFILE":
                allowedClassesFilterMethods.push(profileFilter);
                break;
        }
    });


    allowedClassesFilterMethods.forEach(filterMethod => {
        filterMethod(selection, filteredSelection, contextEntities);
    });

    const activeVisualModel = graph.aggregatorView.getActiveVisualModel();
    if((visibilityFilter === "ONLY-NON-VISIBLE" || visibilityFilter === "ONLY-VISIBLE") && activeVisualModel === null) {
        notifications.error("No active visual model, can't filter based on visual model.");
        return filteredSelection;
    }

    const models = graph.models;

    filteredSelection = visibilityConditionFilter(filteredSelection, visibilityFilter, activeVisualModel);
    if(semanticModelFilter !== null) {
        filteredSelection = totalFilterOnlyRelevantSemanticModelEntities(selection, filteredSelection, semanticModelFilter, models);
    }

    return filteredSelection;
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

/**
 * @returns The {@link originalSelectionToFilter} after the filtering, concatened with the {@link reducedSelection}
 */
function totalFilterOnlyRelevantSemanticModelEntities(originalSelectionToFilter: string[], reducedSelection: string[],
                                                        semanticModelFilter: Record<string, boolean>,
                                                        models: Map<string, EntityModel>): string[] {
    const finalReduction: string[] = [];

    const consideredModels: EntityModel[] = [];
    const notConsideredModels: EntityModel[] = [];
    Object.entries(semanticModelFilter).forEach(([modelId, isConsidered]) => {
        const model = models.get(modelId);
        if(model === undefined) {
            return;
        }
        if(isConsidered) {
            consideredModels.push(model);
        }
        else {
            notConsideredModels.push(model);
        }
    });


    originalSelectionToFilter.forEach(originalSelectionClass => {
        if(sourceModelOfEntity(originalSelectionClass, notConsideredModels) !== undefined) {
            finalReduction.push(originalSelectionClass);
        }
    });

    // Use "Set" to remove duplicates (as in https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array)
    return [...new Set(finalReduction.concat(reducedSelection))];
}


/**
 * @returns Returns identifiers from {@link arrayToFilter} matching the {@link visibilityFilter}.
 */
function visibilityConditionFilter(arrayToFilter: string[], visibilityFilter: VisibilityFilter, visualModel: VisualModel | null): string[] {
    const filteredArray: string[] = arrayToFilter.filter(entity => {
        if(visibilityFilter === "ALL") {
            return true;
        }

        if(visualModel === null) {
            // Can just return the condition, but I felt like this is better
            if(visibilityFilter === "ONLY-NON-VISIBLE") {
                return true;
            }
            return false;
        }

        const isInVisualModel = isEntityInVisualModel(visualModel, entity);
        if(visibilityFilter === "ONLY-VISIBLE" && isInVisualModel) {
            return true;
        }
        else if(visibilityFilter === "ONLY-NON-VISIBLE" && !isInVisualModel) {
            return true;
        }

        return false;
    });


    return filteredArray;
}




/**
 * Puts into {@link filteredSelection} the classes from {@link selection}
 */
function classFilter(selection: string[], filteredSelection: string[], contextEntities: ClassesContextEntities): void {
    selection.map(selectedClassId => {
        if(contextEntities.classes.findIndex(cclass => cclass.id === selectedClassId) >= 0) {
            filteredSelection.push(selectedClassId);
        }
    });
}


/**
 * Puts into {@link filteredSelection} the profiles from {@link selection}
 */
function profileFilter(selection: string[], filteredSelection: string[], contextEntities: ClassesContextEntities): void {
    selection.map(selectedClassId => {
        if(contextEntities.profiles.findIndex(profile => profile.id === selectedClassId) >= 0) {
            filteredSelection.push(selectedClassId);
        }
    });
}
