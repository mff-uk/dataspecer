import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { ClassesContext, ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { sourceModelOfEntity } from "../util/model-utils";
import { Entity, EntityModel } from "@dataspecer/core-v2";
import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship, SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelClassUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { VisualModel } from "@dataspecer/core-v2/visual-model";

export type ClassesContextEntities = {
    classes: SemanticModelClass[],
    relationships: SemanticModelRelationship[],
    generalizations: SemanticModelGeneralization[],
    profiles: (SemanticModelClassUsage | SemanticModelRelationshipUsage)[],
    rawEntities: (Entity | null)[],
}

/**
 * Type representing all the possible extensions of the selection.
 */
export type ExtensionType = "ASSOCIATION" | "ASSOCIATION-SOURCE" | "ASSOCIATION-TARGET" |
                                "GENERALIZATION" | "GENERALIZATION-PARENT" | "GENERALIZATION-CHILD" |
                                "PROFILE-EDGE" | "PROFILE-EDGE-SOURCE" | "PROFILE-EDGE-TARGET" |
                                "PROFILE-CLASS" | "PROFILE-CLASS-PARENT" | "PROFILE-CLASS-CHILD";

/**
 * Type representing all the possible reductions of the selection.
 * @deprecated Too complicated to use
 */
export type ReductionType = ExtensionType | "VISIBLE" | "NON-VISIBLE";

/**
 * Type representing additional visibility filter on the result
 */
export type VisibilityFilter = "ONLY-VISIBLE" | "ONLY-NON-VISIBLE" | "ALL";


/**
 * Extends the given selection.
 * @param selection
 * @param extensionTypes
 * @param visible
 * @param shouldExpandExternalModels If set to true, then allow the extension to go through external models - meaning through elements which are not expanded. If false then
 * don't allow. If false, then this method this method is synchronous!!!
 * @param semanticModelFilter Null if all models should be considered, otherwise record with modelID as key and true as value if the model should be considered, false if it shouldn't be.
 * Models which are not part of the semanticModelFilter, are by default not considered.
 * @param classesContext
 * @param graph
 * @returns Promise which contains the selection after performing the extension corresponding to given arguments.
 * It is promise, because we allow to select classes which are in the external semantic model (SGOV) and not part of current model expansion.
 * But this use-case is not accessible to user from editor, it is only accessible for internal usage in cme, if {@link shouldExpandExternalModels} is set to true.
 */
export const extendSelectionAction = async (selection: string[],
                                        extensionTypes: ExtensionType[],
                                        visible: VisibilityFilter,
                                        shouldExpandExternalModels: boolean,
                                        semanticModelFilter: Record<string, boolean> | null,
                                        classesContext: ClassesContextType | null,
                                        graph: ModelGraphContextType,): Promise<string[]> => {
    if(classesContext === null) {
        return [];
    }

    // TODO: Maybe not necessary - Because I haven't tested how does (in cme-v2) the classesContext behave after expansion of external model.
    // So we create deep copy of the classes context, because we modify it if we perform expansion of external model.
    const entities: ClassesContextEntities = JSON.parse(JSON.stringify(classesContext));

    const visualModel = graph.aggregatorView.getActiveVisualModel();

    let relevantExternalModels;
    if(!shouldExpandExternalModels) {
        relevantExternalModels = null;
    }
    else {
        if(semanticModelFilter === null) {
            semanticModelFilter = {};
            for(const [modelId, _] of graph.models) {
                semanticModelFilter[modelId] = true;
            }
        }
        relevantExternalModels = getRelevantExternalModelsForExtension(semanticModelFilter, graph.models);
    }
    const extension: string[] = [];

    for(const extensionType of extensionTypes) {
        switch(extensionType) {
            case "ASSOCIATION":
                await extendThroughAssociationSources(selection, visible, extension, relevantExternalModels, entities, visualModel);
                await extendThroughAssociationTargets(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "ASSOCIATION-TARGET":
                await extendThroughAssociationTargets(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "ASSOCIATION-SOURCE":
                await extendThroughAssociationSources(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "PROFILE-EDGE":
                await extendThroughProfileEdgeSources(selection, visible, extension, relevantExternalModels, entities, visualModel);
                await extendThroughProfileEdgeTargets(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "PROFILE-EDGE-SOURCE":
                await extendThroughProfileEdgeSources(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "PROFILE-EDGE-TARGET":
                await extendThroughProfileEdgeTargets(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "GENERALIZATION":
                await extendThroughGeneralizationParents(selection, visible, extension, relevantExternalModels, entities, visualModel);
                await extendThroughGeneralizationChildren(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "GENERALIZATION-CHILD":
                await extendThroughGeneralizationChildren(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "GENERALIZATION-PARENT":
                await extendThroughGeneralizationParents(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "PROFILE-CLASS":
                await extendThroughProfileParents(selection, visible, extension, relevantExternalModels, entities, visualModel);
                await extendThroughProfileChildren(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "PROFILE-CLASS-PARENT":
                await extendThroughProfileParents(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
            case "PROFILE-CLASS-CHILD":
                await extendThroughProfileChildren(selection, visible, extension, relevantExternalModels, entities, visualModel);
                break;
        }
    }

    if(semanticModelFilter === null) {
        return extension;
    }
    return filterExtensionUsingSemanticModelFilters(extension, semanticModelFilter, graph.models);
};



/**
 * @returns All the External Semantic Models (SGOV) from the given semantic ones
 */
const getRelevantExternalModelsForExtension = (semanticModelFilter: Record<string, boolean>, models: Map<string, EntityModel>): ExternalSemanticModel[] => {
    return getRelevantModelsForExtension(semanticModelFilter, models).filter(model => model instanceof ExternalSemanticModel);
};

 /**
 *
 * @param semanticModelFilter
 * @returns All the models which should be considered (the value in map is set to True)
 */
 const getRelevantModelsForExtension = (semanticModelFilter: Record<string, boolean>, models: Map<string, EntityModel>): EntityModel[] => {
    const relevantModels = Object.entries(semanticModelFilter).map(([modelId, isConsidered]) => {
        if(isConsidered) {
            return models.get(modelId);
        }
        else {
            return null;
        }
    }).filter(model => model !== null && model !== undefined);

    return relevantModels;
};

function filterExtensionUsingSemanticModelFilters(extension: string[], semanticModelFilter: Record<string, boolean>, models: Map<string, EntityModel>): string[] {
    const relevantModels = getRelevantModelsForExtension(semanticModelFilter, models);
    return extension.map(extendedClassId => {
        if(sourceModelOfEntity(extendedClassId, relevantModels) === undefined) {
            return null;
        }
        else {
            return extendedClassId;
        }
    }).filter(id => id !== null);
}


////////////////////////////////////////
////////////////////////////////////////



// This method can be defined in utils or something
/**
 *
 * @param visualModel
 * @param semanticEntityId
 * @returns Returns true if given {@link semanticEntityId} can be found in given {@link visualModel}. False otherwise.
 */
export function isEntityInVisualModel(visualModel: VisualModel, semanticEntityId: string): boolean {
    // Maybe issues with edges, which are defined by both ends being in visual model, but I think that was changed in cme-v2 (+ currently this method is only for nodes).
    const visualEntity = visualModel.getVisualEntityForRepresented(semanticEntityId);
    const isInVisualModel = visualEntity !== null;
    return isInVisualModel;
}


type SourceOrTargetType = "SOURCE" | "TARGET";
type AssociationType = "CLASSIC" | "PROFILE-EDGE";


/**
 * Adds {@link classIdToAdd} to {@link extension} if it passes the {@link visibilityFilter}.
 */
function addToExtensionIfSatisfiesVisibilityCondition(extension: string[],
                                                        visibilityFilter: VisibilityFilter,
                                                        classIdToAdd: string,
                                                        visualModel: VisualModel | null): void {
    if(visibilityFilter === "ALL") {
        extension.push(classIdToAdd);
        return;
    }

    if(visualModel === null) {
        if(visibilityFilter === "ONLY-NON-VISIBLE") {
            extension.push(classIdToAdd);
        }
        return;
    }

    const isInVisualModel = isEntityInVisualModel(visualModel, classIdToAdd);
    if(visibilityFilter === "ONLY-VISIBLE" && isInVisualModel) {
        extension.push(classIdToAdd);
    }
    else if(visibilityFilter === "ONLY-NON-VISIBLE" && !isInVisualModel) {
        extension.push(classIdToAdd);
    }
}

/**
 * This method goes through all the {@link relevantExternalModel} and checks if {@link selectedClassId} is in any of those.
 * If it is then we allow surroundings of the class.
 * @param selectedClassId
 * @param relevantExternalModels
 * @returns Promise with either null if the selected class isn't part of any of the {@link relevantExternalModel}, otherwise promise with external model where it lies
 *
 */
async function allowSurrondingsInCaseOfExternalSemanticModel(selectedClassId: string,
                                                                relevantExternalModels: ExternalSemanticModel[] | null,
                                                                contextEntities: ClassesContextEntities): Promise<ExternalSemanticModel | null> {
    if(relevantExternalModels === null) {
        return null;
    }

    const externalModelWhereSelectedClassResides = sourceModelOfEntity(selectedClassId, relevantExternalModels) as ExternalSemanticModel;
    if(externalModelWhereSelectedClassResides !== undefined) {
        await externalModelWhereSelectedClassResides.allowClassSurroundings(selectedClassId);
        extendEntityArraysBasedOnExternalAllowanceOfSurroundings(externalModelWhereSelectedClassResides, contextEntities);
        return externalModelWhereSelectedClassResides;
    }

    return null;
}



// The source class of the profile is missing, we don't know where it resides though, so we have to try to expand every model
// Note: Once we expand we can't unexpand though, but that is kind of how it is designed even for the search bar
/**
 * If the classId can't be found in list of all entities, then try to allow it in all of the given {@link relevantExternalModels}.
 * @param classId
 * @param relevantExternalModels
 * @returns False if it can be found in list of all entities, true otherwise (so we tried to perform expansion).
 */
async function tryAllowInExternalModelsClassIfCantbeFound(classId: string,
                                                            relevantExternalModels: ExternalSemanticModel[] | null,
                                                            contextEntities: ClassesContextEntities): Promise<boolean> {
    if(relevantExternalModels === null) {
        return false;
    }

    if(contextEntities.rawEntities.find(entity => entity?.id === classId) === undefined) {
        await tryAllowClassInExternalSemanticModels(classId, relevantExternalModels);
        extendEntityArraysBasedOnExternalAllowanceOfClass(relevantExternalModels, contextEntities);
        return true;
    }

    return false;
}


/**
 * For each of the {@link ExternalSemanticModels} try to allow the given {@link classId}
 */
async function tryAllowClassInExternalSemanticModels(classId: string, relevantExternalModels: ExternalSemanticModel[] | null) {
    if(relevantExternalModels === null) {
        return;
    }

    // Try everything, we have no idea in which external model it resides
    for (const externalModelWhereSelectedClassCouldPossiblyReside of relevantExternalModels) {
        if(externalModelWhereSelectedClassCouldPossiblyReside !== undefined) {
            await externalModelWhereSelectedClassCouldPossiblyReside.allowClass(classId);
        }
    }
}


/**
 * Extends the internally saved classes ({@link contextEntities}), rawEntities, etc. based on entities present in {@link relevantExternalModels},
 * but not present in the internally saved stuff.
 */
function extendEntityArraysBasedOnExternalAllowanceOfClass(relevantExternalModels: ExternalSemanticModel[] | null,
                                                            contextEntities: ClassesContextEntities): void {
    if(relevantExternalModels === null) {
        return;
    }

    relevantExternalModels.forEach(relevantExternalModel => {
        extendEntityArraysBasedOnExternalAllowanceOfSurroundings(relevantExternalModel, contextEntities);
    });
}


/**
 * Extends the classes, rawEntities, profiles, etc. based on newly added (allowed) entities from external models
 * @param relevantExternalModel
 */
function extendEntityArraysBasedOnExternalAllowanceOfSurroundings(relevantExternalModel: ExternalSemanticModel, contextEntities: ClassesContextEntities): void {
    const newRawEntities: Entity[] = [];
    const externalEntities = relevantExternalModel.getEntities();
    Object.values(externalEntities).forEach(entity => {
        if(contextEntities.rawEntities.find(rawEntity => entity.id === rawEntity?.id) === undefined) {
            newRawEntities.push(entity);
            if(isSemanticModelClass(entity)) {
                contextEntities.classes.push(entity);
            }
            else if(isSemanticModelClassUsage(entity)) {
                contextEntities.profiles.push(entity);
            }
            else if(isSemanticModelGeneralization(entity)) {
                contextEntities.generalizations.push(entity);
            }
            else if(isSemanticModelRelationshipUsage(entity)) {
                contextEntities.profiles.push(entity);
            }
            else if(isSemanticModelRelationship(entity)) {
                contextEntities.relationships.push(entity);
            }
        }
    });

    contextEntities.rawEntities = contextEntities.rawEntities.concat(newRawEntities);
}


function isClassOrClassProfile(classId: string, contextEntities: ClassesContextEntities) {
    const isClassOrClassProfile = !(contextEntities.classes.find(cclass => cclass.id === classId) === undefined &&
                                    contextEntities.profiles.find(profile => profile.id === classId) === undefined);
    return isClassOrClassProfile;
}


/**
 * The internal function used for the extension through associations (and profiled associations), the type of association is decided through
 * {@link associationType} and the direction is decided through {@link associationDirection}
 */
async function extendThroughAssociation(selection: string[],
                                        visible: VisibilityFilter,
                                        associationDirection: SourceOrTargetType,
                                        associationType: AssociationType,
                                        outputArrayToExtend: string[],
                                        relevantExternalModels: ExternalSemanticModel[] | null,
                                        contextEntities: ClassesContextEntities,
                                        visualModel: VisualModel | null): Promise<void> {
    const getSecondEnd = (end: SourceOrTargetType): SourceOrTargetType => {
        return end === "SOURCE" ? "TARGET" : "SOURCE";
    };

    const getEndIndexFromEnd = (end: SourceOrTargetType): 0 | 1 => {
        if(end === "SOURCE") {
            return 0;
        }

        return 1;
    };

    const checkForAssociatedClassOrClassProfile = async (id: string, end: SourceOrTargetType, relationship: SemanticModelRelationship) => {
        // Maybe possible issues with attributes?
        const endIndex = getEndIndexFromEnd(end);
        const otherEndIndex = getEndIndexFromEnd(getSecondEnd(end));
        const otherEndId = relationship.ends[otherEndIndex]?.concept;

        if(otherEndId !== undefined && otherEndId !== null) {
            await tryAllowInExternalModelsClassIfCantbeFound(otherEndId, relevantExternalModels, contextEntities);
        }

        if(relationship.ends[endIndex]?.concept === id && otherEndId !== null) {
            let classOnOtherEnd: SemanticModelClass | SemanticModelClassUsage | undefined = contextEntities.classes.find(cclass => cclass.id === otherEndId);
            if(classOnOtherEnd === undefined) {
                const profile = contextEntities.profiles.find(profile => profile.id === otherEndId);
                if(isSemanticModelClassUsage(profile as Entity)) {
                    classOnOtherEnd = contextEntities.profiles.find(profile => profile.id === otherEndId) as SemanticModelClassUsage;
                }
            }
            return classOnOtherEnd;
        }
        else {
            return null;
        }
    };

    for(const selectedClassId of selection) {
        if(!isClassOrClassProfile(selectedClassId, contextEntities)) {
            return;         // TODO: Maybe remove from the selection?
        }
        await allowSurrondingsInCaseOfExternalSemanticModel(selectedClassId, relevantExternalModels, contextEntities);

        let relationshipsToCheck: SemanticModelRelationship[] = [];
        if(associationType === "PROFILE-EDGE") {
            contextEntities.profiles.forEach(profile => {
                if(isSemanticModelRelationshipUsage(profile)) {
                    const profiledRelationship = contextEntities.relationships.find(relationship => {
                        return relationship.id === profile.usageOf;
                    });
                    if(profiledRelationship !== undefined) {
                        relationshipsToCheck.push(profiledRelationship);
                    }
                }
            });
        }
        else if(associationType === "CLASSIC") {
            relationshipsToCheck = contextEntities.relationships;
        }

        const extension: (SemanticModelClass | SemanticModelClassUsage)[] = [];
        for(const relationship of relationshipsToCheck) {
            const candidate = await checkForAssociatedClassOrClassProfile(selectedClassId, getSecondEnd(associationDirection), relationship);
            if(candidate !== null && candidate !== undefined) {
                extension.push(candidate);
            }
        }

        extension.forEach(cclass => {
            // Maybe should be put before the external semantic model expansion, since for "visible" condition we don't want to expand
            addToExtensionIfSatisfiesVisibilityCondition(outputArrayToExtend, visible, cclass.id, visualModel);
        });
    }

}


/**
 * Extends {@link outputArrayToExtend} by all direct association sources, which also pass the {@link visibilityFilter} and are within {@link relevantExternalModels}
 */
async function extendThroughAssociationSources(selection: string[],
                                                visible: VisibilityFilter,
                                                outputArrayToExtend: string[],
                                                relevantExternalModels: ExternalSemanticModel[] | null,
                                                contextEntities: ClassesContextEntities,
                                                visualModel: VisualModel | null): Promise<void> {
    await extendThroughAssociation(selection, visible, "SOURCE", "CLASSIC", outputArrayToExtend, relevantExternalModels, contextEntities, visualModel);
}


/**
 * Extends {@link outputArrayToExtend} by all direct association targets, which also pass the {@link visibilityFilter} and are within {@link relevantExternalModels}
 */
async function extendThroughAssociationTargets(selection: string[],
                                                visible: VisibilityFilter,
                                                outputArrayToExtend: string[],
                                                relevantExternalModels: ExternalSemanticModel[] | null,
                                                contextEntities: ClassesContextEntities,
                                                visualModel: VisualModel | null): Promise<void> {
    await extendThroughAssociation(selection, visible, "TARGET", "CLASSIC", outputArrayToExtend, relevantExternalModels, contextEntities, visualModel);
}

////////////////////////////////////////
////////////////////////////////////////


/**
 * Extends {@link outputArrayToExtend} by all direct profiled edges sources, which also pass the {@link visibilityFilter} and are within {@link relevantExternalModels}
 */
async function extendThroughProfileEdgeSources(selection: string[],
                                                visible: VisibilityFilter,
                                                outputArrayToExtend: string[],
                                                relevantExternalModels: ExternalSemanticModel[] | null,
                                                contextEntities: ClassesContextEntities,
                                                visualModel: VisualModel | null): Promise<void> {
    await extendThroughAssociation(selection, visible, "SOURCE", "PROFILE-EDGE", outputArrayToExtend, relevantExternalModels, contextEntities, visualModel);
}


/**
 * Extends {@link outputArrayToExtend} by all direct profiled edges targets, which also pass the {@link visibilityFilter} and are within {@link relevantExternalModels}
 */
async function extendThroughProfileEdgeTargets(selection: string[],
                                                visible: VisibilityFilter,
                                                outputArrayToExtend: string[],
                                                relevantExternalModels: ExternalSemanticModel[] | null,
                                                contextEntities: ClassesContextEntities,
                                                visualModel: VisualModel | null): Promise<void> {
    await extendThroughAssociation(selection, visible, "TARGET", "PROFILE-EDGE", outputArrayToExtend, relevantExternalModels, contextEntities, visualModel);
}

////////////////////////////////////////
////////////////////////////////////////

type ParentChildType = "PARENT" | "CHILD";
type ParentChildGeneralizationPropertyType = "parent" | "child";
function getOtherValueInParentChildType(parentChild: ParentChildType): ParentChildType {
    return parentChild === "CHILD" ? "PARENT" : "CHILD";
}


/**
 * Helper function to convert between two internal types
 */
function convertParentChildToGeneralizationProperty(parentChild: ParentChildType): ParentChildGeneralizationPropertyType {
    return parentChild.toLowerCase() as ParentChildGeneralizationPropertyType;
}


/**
 * The internal function used for the extension through generalization, the direction of extension is decided through {@link parentChild} parameter.
 */
async function extendThroughGeneralization(selection: string[],
                                            visible: VisibilityFilter,
                                            parentChild: ParentChildType,
                                            outputArrayToExtend: string[],
                                            relevantExternalModels: ExternalSemanticModel[] | null,
                                            contextEntities: ClassesContextEntities,
                                            visualModel: VisualModel | null): Promise<void> {
    for(const selectedClassId of selection) {
        if(!isClassOrClassProfile(selectedClassId, contextEntities)) {
            return;         // TODO: Maybe remove from the selection?
        }
        await allowSurrondingsInCaseOfExternalSemanticModel(selectedClassId, relevantExternalModels, contextEntities);

        const theEndOfGeneralizationWhereShouldBeTheSelectedClass = convertParentChildToGeneralizationProperty(getOtherValueInParentChildType(parentChild));
        const theOtherEndOfGeneralization = convertParentChildToGeneralizationProperty(parentChild);
        for(const entity of contextEntities.rawEntities) {
            if(!isSemanticModelGeneralization(entity)) {
                continue;
            }
            const generalization = entity as SemanticModelGeneralization;
            if(generalization[theEndOfGeneralizationWhereShouldBeTheSelectedClass] === selectedClassId) {
                const otherEndId = generalization[theOtherEndOfGeneralization];
                await tryAllowInExternalModelsClassIfCantbeFound(otherEndId, relevantExternalModels, contextEntities);
                addToExtensionIfSatisfiesVisibilityCondition(outputArrayToExtend, visible, otherEndId, visualModel);
            }
        }
    }
}


/**
 * Extends {@link outputArrayToExtend} by all direct parents in generalization hirearchy, which also pass the {@link visibilityFilter} and are within {@link relevantExternalModels}
 */
async function extendThroughGeneralizationParents(selection: string[],
                                                    visible: VisibilityFilter,
                                                    outputArrayToExtend: string[],
                                                    relevantExternalModels: ExternalSemanticModel[] | null,
                                                    contextEntities: ClassesContextEntities,
                                                    visualModel: VisualModel | null): Promise<void> {
    await extendThroughGeneralization(selection, visible, "PARENT", outputArrayToExtend, relevantExternalModels, contextEntities, visualModel);
}


/**
 * Extends {@link outputArrayToExtend} by all direct children in generalization hirearchy, which also pass the {@link visibilityFilter} and are within {@link relevantExternalModels}
 */
async function extendThroughGeneralizationChildren(selection: string[],
                                                    visible: VisibilityFilter,
                                                    outputArrayToExtend: string[],
                                                    relevantExternalModels: ExternalSemanticModel[] | null,
                                                    contextEntities: ClassesContextEntities,
                                                    visualModel: VisualModel | null): Promise<void> {
    await extendThroughGeneralization(selection, visible, "CHILD", outputArrayToExtend, relevantExternalModels, contextEntities, visualModel);
}

////////////////////////////////////////
////////////////////////////////////////

/**
 * The internal function used for the extension through profiles, the direction of extension is decided through {@link parentChild} parameter.
 */
async function extendThroughProfile(selection: string[],
                                    visible: VisibilityFilter,
                                    parentChild: ParentChildType,
                                    outputArrayToExtend: string[],
                                    relevantExternalModels: ExternalSemanticModel[] | null,
                                    contextEntities: ClassesContextEntities,
                                    visualModel: VisualModel | null) {
    for(const selectedClassId of selection) {
        const selectedClass = contextEntities.classes.find(entity => entity?.id === selectedClassId) ??
                                contextEntities.profiles.find(entity => isSemanticModelClassUsage(entity) && entity?.id === selectedClassId);
        if(selectedClass === undefined) {
            continue;         // TODO: Maybe remove from the selection?
        }

        if(parentChild === "CHILD") {
            contextEntities.rawEntities.forEach(entity => {
                if(!isSemanticModelClassUsage(entity)) {
                    return;
                }

                if((entity as SemanticModelClassUsage).usageOf === selectedClassId) {
                    addToExtensionIfSatisfiesVisibilityCondition(outputArrayToExtend, visible, entity.id, visualModel);
                }
            });
        }
        else if(parentChild === "PARENT") {
            if(!isSemanticModelClassUsage(selectedClass)) {
                continue;
            }
            const selectedClassAsProfile = (selectedClass as SemanticModelClassUsage);

            await tryAllowInExternalModelsClassIfCantbeFound(selectedClassAsProfile.usageOf, relevantExternalModels, contextEntities);
            addToExtensionIfSatisfiesVisibilityCondition(outputArrayToExtend, visible, selectedClassAsProfile.usageOf, visualModel);
        }
    }
}


/**
 * Extends {@link outputArrayToExtend} by all directly profiled classes, which also pass the {@link visibilityFilter} and are within {@link relevantExternalModels}
 */
async function extendThroughProfileParents(selection: string[],
                                            visible: VisibilityFilter,
                                            outputArrayToExtend: string[],
                                            relevantExternalModels: ExternalSemanticModel[] | null,
                                            contextEntities: ClassesContextEntities,
                                            visualModel: VisualModel | null) {
    await extendThroughProfile(selection, visible, "PARENT", outputArrayToExtend, relevantExternalModels, contextEntities, visualModel);
}


/**
 * Extends {@link outputArrayToExtend} by all direct profile classes, which also pass the {@link visibilityFilter} and are within {@link relevantExternalModels}
 */
async function extendThroughProfileChildren(selection: string[],
                                            visibilityFilter: VisibilityFilter,
                                            outputArrayToExtend: string[],
                                            relevantExternalModels: ExternalSemanticModel[] | null,
                                            contextEntities: ClassesContextEntities,
                                            visualModel: VisualModel | null): Promise<void> {
    await extendThroughProfile(selection, visibilityFilter, "CHILD", outputArrayToExtend, relevantExternalModels, contextEntities, visualModel);
}


////////////////////////////////////////
////////////////////////////////////////

function extendThroughVisualModel(selection: string[], visualModelId: string) {
    throw new Error("Function not implemented.");
}


/**
 * @returns Class and Class usages of the given moddel
 */
export const getClassesAndClassUsages = (model: EntityModel): (SemanticModelClass | SemanticModelClassUsage)[] => {
    return Object.values(model.getEntities()).filter((entity) => isSemanticModelClass(entity) || isSemanticModelClassUsage(entity));
};


/**
 *
 * @param semanticModel
 * @returns All class and class usages within model
 */
export function getSelectionForWholeSemanticModel(semanticModel: EntityModel): string[] {
    const extension: string[] = [];
    const classesAndUsages = getClassesAndClassUsages(semanticModel);
    classesAndUsages.forEach(entity => {
        extension.push(entity.id);
    });

    return extension;
}