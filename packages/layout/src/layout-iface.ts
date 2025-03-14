import { SemanticModelEntity, isSemanticModelClass, isSemanticModelRelationship, isSemanticModelGeneralization,
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
    isSemanticModelAttribute
 } from "@dataspecer/core-v2/semantic-model/concepts";

import { IGraphClassic, IMainGraphClassic, IVisualNodeComplete } from "./graph-iface";
import { ConstraintContainer } from "./configs/constraint-container";
import { VisualEntities } from "./migration-to-cme-v2";
import { Entity, EntityModel } from "@dataspecer/core-v2";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";


export type LayoutMethod = (inputSemanticModel: Record<string, SemanticModelEntity>, options?: object) => Promise<VisualEntities>


/**
 * The object which satisfy this interface can be used for layouting. The codeflow when using the interface is as follows.
 * Call {@link prepareFromGraph} to prepare the layouting algorithm and then call {@link run} to layout based on the preparation.
 * It is also possible to call {@link runGeneralizationLayout} to layout the content the generalization subgraphs.
 */
export interface LayoutAlgorithm {

    /**
     * Prepares the algorithm for future layouting. The future layouting will layout given graph and use given constraints.
     * @param graph
     * @param constraintContainer
     * @param nodeDimensionQueryHandler
     * @returns
     */
    prepareFromGraph: (graph: IGraphClassic, constraintContainer: ConstraintContainer) => void,
    /**
     * Runs the layouting algorithm on the graph prepared earlier.
     * @param shouldCreateNewGraph if true then new graph is created, otherwise the one passed in preparation phase is changed in place
     * @returns promise which on resolve returns the layouted graph
     */
    run: (shouldCreateNewGraph: boolean) => Promise<IMainGraphClassic>,
    /**
     * Runs the layouting algorithm on the graph prepared earlier. Layouts only the generalizations subgraphs separately.
     * @param shouldCreateNewGraph if true then new graph is created, otherwise the one passed in preparation phase is changed in place
     * @returns promise which on resolve returns the layouted graph
     */
    // TODO: Again this could be generalized that we would layout list of any given subgraphs instead of the generalization subgraphs, so it sohuld be moved one level up and
    //       we should just call layout on the given subgraph
    runGeneralizationLayout: (shouldCreateNewGraph: boolean) => Promise<IMainGraphClassic>,

    // TODO: Again - why am I putting properties into interface??
    constraintContainer: ConstraintContainer;
}


// TODO RadStr: Remove the model from the fields ... that is semanticModelClass --> semanticClass

export type EntitiesBundle = {
    sourceEntityModelIdentifier: string,
    semanticModelEntity: SemanticModelEntity,
};

type ClassesBundle = {
    sourceEntityModelIdentifier: string,
    semanticModelClass: SemanticModelClass,
};

type ClassProfilesBundle = {
    sourceEntityModelIdentifier: string,
    semanticModelClassProfile: SemanticModelClassProfile
};

export type RelationshipsBundle = {
    sourceEntityModelIdentifier: string,
    semanticModelRelationship: SemanticModelRelationship,
};

export type RelationshipsProfilesBundle = {
    sourceEntityModelIdentifier: string,
    semanticModelRelationshipProfile: SemanticModelRelationshipProfile,
};

export type GeneralizationsBundle = {
    sourceEntityModelIdentifier: string,
    semanticModelGeneralization: SemanticModelGeneralization,
};

type AttributesBundle = {
    sourceEntityModelIdentifier: string,
    semanticModelRelationship: SemanticModelRelationship,
};


export interface ExtractedModels {
    entities: EntitiesBundle[],
    classes: ClassesBundle[],
    classesProfiles: ClassProfilesBundle[],
    relationships: RelationshipsBundle[],
    relationshipsProfiles: RelationshipsProfilesBundle[],
    generalizations: GeneralizationsBundle[],
    attributes: AttributesBundle[],
}

export type AllowedEdgeBundleTypes = RelationshipsBundle | RelationshipsProfilesBundle | GeneralizationsBundle | ClassProfilesBundle;


// TODO: Maybe it makes more sense to make the interface a abstract class instead
/**
 * This interface defines methods for transformation between our graph representation and layouting library representation.
 */
export interface GraphTransformer {

    /** Expected call flow is as follows:
     * 1) Create graph representation of type {@link IGraphClassic}
     * 2) Call this method
     * 3) Perform layouting
     * 4) Update existing graph representation using {@link updateExistingGraphRepresentationBasedOnLibraryRepresentation} (or create new one using {@link convertLibraryToGraphRepresentation}). Created representations already include VisualModel in form of {@link IVisualNodeComplete} on nodes
     * or just call {@link convertToDataspecerRepresentation} if you no longer need the graph structure
     */
    convertGraphToLibraryRepresentation(graph: IGraphClassic, shouldSetLayoutOptions: boolean, constraintContainer: ConstraintContainer): object,

    /**
     * Converts library graph representation to our graph representation.
     * Creates new graph instance with positions set based on the values in library representation of the graph.
     */
    convertLibraryToGraphRepresentation(libraryRepresentation: object | null, includeDummies: boolean): IGraphClassic,

    /**
     * Update positions of visual entities in our graph representation based on the positions in the layout library graph representation.
     */
    updateExistingGraphRepresentationBasedOnLibraryRepresentation(libraryRepresentation: object | null,
                                                                    graphToBeUpdated: IGraphClassic,
                                                                    includeNewVertices: boolean,
                                                                    shouldUpdateEdges: boolean): void,
}


function filterForExtraction(entities: EntitiesBundle[], predicate: (resource: Entity | null) => boolean) {
    const values = entities.filter(({semanticModelEntity}) => {
        return predicate(semanticModelEntity);
    });

    return values;
}

/**
 * Converts entities from given semantic model into concrete data types. Returns them in object of type {@link ExtractedModels}
 */
export function extractModelObjects(inputSemanticModels: Map<string, EntityModel>): ExtractedModels {
    const entitiesInModels: EntitiesBundle[][] = [...inputSemanticModels.entries()].map(([modelIdentifier, model]) => {
        return Object.entries(model.getEntities() as Record<string, SemanticModelEntity>).map(([key, value]) => ({
            sourceEntityModelIdentifier: modelIdentifier,
            semanticModelEntity: value,
        }));
    });

    const entities: EntitiesBundle[] = [];
    entitiesInModels.forEach(model => {
        entities.push(...model);
    });

    const classes = filterForExtraction(entities, isSemanticModelClass).map((o) => {
        return {
            sourceEntityModelIdentifier: o.sourceEntityModelIdentifier,
            semanticModelClass: o.semanticModelEntity as SemanticModelClass,
        }
    });
    const classesProfiles = filterForExtraction(entities, isSemanticModelClassProfile).map((o) => {
        return {
            sourceEntityModelIdentifier: o.sourceEntityModelIdentifier,
            semanticModelClassProfile: o.semanticModelEntity as SemanticModelClassProfile,
        }
    });
    const relationshipsProfiles = filterForExtraction(entities, isSemanticModelRelationshipProfile).map((o) => {
        return {
            sourceEntityModelIdentifier: o.sourceEntityModelIdentifier,
            semanticModelRelationshipProfile: o.semanticModelEntity as unknown as SemanticModelRelationshipProfile,
        }
    });
    const generalizations = filterForExtraction(entities, isSemanticModelGeneralization).map((o) => {
        return {
            sourceEntityModelIdentifier: o.sourceEntityModelIdentifier,
            semanticModelGeneralization: o.semanticModelEntity as SemanticModelGeneralization,
        }
    });
    const attributes = filterForExtraction(entities, isSemanticModelAttribute).map((o) => {
        return {
            sourceEntityModelIdentifier: o.sourceEntityModelIdentifier,
            semanticModelRelationship: o.semanticModelEntity as SemanticModelRelationship,
        }
    });

    // TODO: Later take care of profiled attributes vs profile relationships in same way
    const relationships = entities.filter((o) => (isSemanticModelRelationship(o.semanticModelEntity) &&
                                            !isSemanticModelAttribute(o.semanticModelEntity))).map((o) => {
                                                return {
                                                    sourceEntityModelIdentifier: o.sourceEntityModelIdentifier,
                                                    semanticModelRelationship: o.semanticModelEntity as SemanticModelRelationship,
                                                }
                                            });


    return {
        entities,
        classes,
        classesProfiles,
        relationships,
        relationshipsProfiles,
        generalizations,
        attributes,
    };
}



type RelationshipSourceTarget = {
    source: string,
    target: string,
    sourceIndex: 0 | 1,
    targetIndex: 0 | 1,
}

/**
 * @returns Returns the identifiers of source and target for {@link relationship} and the index where each end lies.
 */
export function getEdgeSourceAndTargetRelationship(
    relationship: SemanticModelRelationship | SemanticModelRelationshipProfile
): RelationshipSourceTarget {
    let source, target: string;
    let sourceIndex, targetIndex: 0 | 1;
    if(relationship.ends[0].iri == null) {
        sourceIndex = 0;
        targetIndex = 1;
    }
    else {
        sourceIndex = 1;
        targetIndex = 0;
    }

    source = relationship.ends[sourceIndex].concept;
    target = relationship.ends[targetIndex].concept;

    return {source, target, sourceIndex, targetIndex};
}


export function getEdgeSourceAndTargetGeneralization(relationship: SemanticModelGeneralization): {source: string, target: string} {
    return {source: relationship.child, target: relationship.parent};
}
