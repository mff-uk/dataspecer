import { EntityModel } from "@dataspecer/core-v2";
import { sourceModelOfEntity } from "../util/model-utils";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { isSemanticModelClass, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { ClassesContextEntities, getSemanticClassIdentifier, getSemanticEdgeIdentifier, isEntityInVisualModel, VisibilityFilter } from "./extend-selection-action";
import { ClassesContextType } from "../context/classes-context";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

/**
 * Type representing total filter on the type of entity.
 */
export type TotalFilter = "PROFILE-CLASS" | "NORMAL-CLASS" | "PROFILE-EDGE" | "NORMAL-EDGE" | "GENERALIZATION";

/**
 * Appends to {@link filteredNodeSelection} the classes from {@link nodeSelection} passing filter
 * and into {@link filteredEdgeSelection} the edges from {@link edgeSelection} passing filter.
 * Note that filter is usually either for nodes or for edges. So usually either {@link filteredNodeSelection} or {@link filteredEdgeSelection} is unchanged.
 */
type TotalFilterMethod = (nodeSelection: string[], areVisualModelIdentifiers: boolean,
                            filteredNodeSelection: string[],
                            edgeSelection: string[], filteredEdgeSelection: string[],
                            contextEntities: ClassesContextEntities,
                            visualModel: VisualModel | null) => void;


export type Selections = {
    nodeSelection: string[],
    edgeSelection: string[],
};


export type SelectionsWithIdInfo = Selections & {areVisualModelIdentifiers: boolean};



/**
 *
 * @returns Filtered nodeSelection and edgeSelection stored inside {@link selections} based on {@link filters} and {@link visibilityFilter} and {@link semanticModelFilter}
 */
export function reductionTotalFilterAction(selections: SelectionsWithIdInfo,
                                            filters: TotalFilter[],
                                            visibilityFilter: VisibilityFilter,
                                            semanticModelFilter: Record<string, boolean> | null,
                                            graph: ModelGraphContextType,
                                            notifications: UseNotificationServiceWriterType,
                                            classesContext: ClassesContextType | null): Selections {
    if(classesContext === null) {
        notifications.error("Classes context is null, can't filter the selection");
        return {
            nodeSelection: [...selections.nodeSelection],
            edgeSelection: [...selections.edgeSelection]
        };
    }


    let filteredNodeSelection: string[] = [];
    let filteredEdgeSelection: string[] = [];
    const allowedClassesFilterMethods: TotalFilterMethod[] = [];
    const contextEntities: ClassesContextEntities = classesContext;

    const activeVisualModel = graph.aggregatorView.getActiveVisualModel();
    if((visibilityFilter === "ONLY-NON-VISIBLE" || visibilityFilter === "ONLY-VISIBLE") && activeVisualModel === null) {
        notifications.error("No active visual model, can't filter based on visual model. Returning current result without visibility filter.");
        return {
            nodeSelection: filteredNodeSelection,
            edgeSelection: filteredEdgeSelection,
        };
    }

    for (const filter of filters) {
        const filterMethod = ALLOWED_FILTERS[filter];
        if(filterMethod === undefined) {
            notifications.error("The filter for selection is not defined, probably programmer error");
        }
        else {
            allowedClassesFilterMethods.push(ALLOWED_FILTERS[filter]);
        }
    };


    allowedClassesFilterMethods.forEach(filterMethod => {
        filterMethod(selections.nodeSelection, selections.areVisualModelIdentifiers, filteredNodeSelection, selections.edgeSelection, filteredEdgeSelection, contextEntities, activeVisualModel);
    });

    const models = graph.models;

    filteredNodeSelection = visibilityConditionFilter(filteredNodeSelection, selections.areVisualModelIdentifiers, visibilityFilter, activeVisualModel);
    filteredEdgeSelection = visibilityConditionFilter(filteredEdgeSelection, selections.areVisualModelIdentifiers, visibilityFilter, activeVisualModel);
    if(semanticModelFilter !== null) {
        filteredNodeSelection = totalFilterOnlyRelevantSemanticModelEntities(selections.nodeSelection, filteredNodeSelection, semanticModelFilter, models);
        filteredEdgeSelection = totalFilterOnlyRelevantSemanticModelEntities(selections.edgeSelection, filteredEdgeSelection, semanticModelFilter, models);
    }

    return {
        nodeSelection: filteredNodeSelection,
        edgeSelection: filteredEdgeSelection,
    };
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

/**
 * @returns The {@link selectionToFilter} after the filtering, concatened with the {@link selectionAfterFiltering}
 */
function totalFilterOnlyRelevantSemanticModelEntities(selectionToFilter: string[], selectionAfterFiltering: string[],
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


    selectionToFilter.forEach(originalSelectionClass => {
        if(sourceModelOfEntity(originalSelectionClass, notConsideredModels) !== undefined) {
            finalReduction.push(originalSelectionClass);
        }
    });

    // Use "Set" to remove duplicates (as in https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array)
    return [...new Set(finalReduction.concat(selectionAfterFiltering))];
}


/**
 * @returns Returns identifiers from {@link identifiersToFilter} matching the {@link visibilityFilter}.
 */
function visibilityConditionFilter(identifiersToFilter: string[], areIdentifiersFromVisualModel: boolean,
                                    visibilityFilter: VisibilityFilter, visualModel: VisualModel | null): string[] {
    const filteredArray: string[] = identifiersToFilter.filter(entity => {
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

        const isInVisualModel = isEntityInVisualModel(visualModel, entity, areIdentifiersFromVisualModel);
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


const ALLOWED_FILTERS: Record<TotalFilter, TotalFilterMethod> = {
    "NORMAL-CLASS": classFilter,
    "PROFILE-CLASS": profileClassFilter,
    "NORMAL-EDGE": normalEdgeFilter,
    "PROFILE-EDGE": profileEdgeFilter,
    "GENERALIZATION": generalizationFilter,
}


function classFilter(nodeSelection: string[],
                        areVisualModelIdentifiers: boolean,
                        filteredNodeSelection: string[],
                        edgeSelection: string[],
                        filteredEdgeSelection: string[],
                        contextEntities: ClassesContextEntities,
                        visualModel: VisualModel | null): void {
    nodeSelection.map(selectedClassId => {
        const selectedClassSemanticId = getSemanticClassIdentifier(selectedClassId, areVisualModelIdentifiers, visualModel);
        if(contextEntities.classes.findIndex(cclass => cclass.id === selectedClassSemanticId) >= 0) {
            filteredNodeSelection.push(selectedClassId);
        }
    });
}

function profileClassFilter(nodeSelection: string[],
                            areVisualModelIdentifiers: boolean,
                            filteredNodeSelection: string[],
                            edgeSelection: string[],
                            filteredEdgeSelection: string[],
                            contextEntities: ClassesContextEntities,
                            visualModel: VisualModel | null): void {
    nodeSelection.map(selectedClassId => {
        const selectedClassSemanticId = getSemanticClassIdentifier(selectedClassId, areVisualModelIdentifiers, visualModel);
        if(contextEntities.profiles.findIndex(profile => profile.id === selectedClassSemanticId) >= 0) {
            filteredNodeSelection.push(selectedClassId);
        }
    });

    // The edges representing class profile
    edgeSelection.map(selectedEdgeId => {
        const selectedEdgeSemanticId = getSemanticEdgeIdentifier(selectedEdgeId, areVisualModelIdentifiers, visualModel);
        if(selectedEdgeSemanticId === "CLASS-PROFILE-EDGE") {
            filteredEdgeSelection.push(selectedEdgeId);
        }
    });
}

function normalEdgeFilter(nodeSelection: string[],
                            areVisualModelIdentifiers: boolean,
                            filteredNodeSelection: string[],
                            edgeSelection: string[],
                            filteredEdgeSelection: string[],
                            contextEntities: ClassesContextEntities,
                            visualModel: VisualModel | null): void {
    edgeSelection.map(selectedEdgeId => {
        const selectedEdgeSemanticId = getSemanticEdgeIdentifier(selectedEdgeId, areVisualModelIdentifiers, visualModel);
        if(contextEntities.relationships.findIndex(relationship => relationship.id === selectedEdgeSemanticId) >= 0) {
            filteredEdgeSelection.push(selectedEdgeId);
        }
    });
}

function profileEdgeFilter(nodeSelection: string[],
                            areVisualModelIdentifiers: boolean,
                            filteredNodeSelection: string[],
                            edgeSelection: string[],
                            filteredEdgeSelection: string[],
                            contextEntities: ClassesContextEntities,
                            visualModel: VisualModel | null): void {
    edgeSelection.map(selectedEdgeId => {
        const selectedEdgeSemanticId = getSemanticEdgeIdentifier(selectedEdgeId, areVisualModelIdentifiers, visualModel);
        if(contextEntities.profiles.findIndex(relationshipProfile => relationshipProfile.id === selectedEdgeSemanticId && isSemanticModelRelationshipUsage(relationshipProfile)) >= 0) {
            filteredEdgeSelection.push(selectedEdgeId);
        }
    });
}

function generalizationFilter(nodeSelection: string[],
                                areVisualModelIdentifiers: boolean,
                                filteredNodeSelection: string[],
                                edgeSelection: string[],
                                filteredEdgeSelection: string[],
                                contextEntities: ClassesContextEntities,
                                visualModel: VisualModel | null): void {
    edgeSelection.map(selectedEdgeId => {
        const selectedEdgeSemanticId = getSemanticEdgeIdentifier(selectedEdgeId, areVisualModelIdentifiers, visualModel);
        if(contextEntities.generalizations.findIndex(generalization => generalization.id === selectedEdgeSemanticId) >= 0) {
            filteredEdgeSelection.push(selectedEdgeId);
        }
    });
}
