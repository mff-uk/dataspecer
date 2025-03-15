import {
    SemanticModelEntity,
    isSemanticModelClass,
    isSemanticModelRelationship,
    isSemanticModelGeneralization,
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
    isSemanticModelAttribute
 } from "@dataspecer/core-v2/semantic-model/concepts";

import { Graph, MainGraph } from "../graph/representation/graph";
import { ConstraintContainer } from "../configs/constraint-container";
import { VisualEntities } from "../migration-to-cme-v2";
import { Entity, EntityModel } from "@dataspecer/core-v2";
import {
    isSemanticModelClassProfile,
    isSemanticModelRelationshipProfile,
    SemanticModelClassProfile,
    SemanticModelRelationshipProfile
} from "@dataspecer/core-v2/semantic-model/profile/concepts";


export type LayoutMethod = (inputSemanticModel: Record<string, SemanticModelEntity>, options?: object) => Promise<VisualEntities>


/**
 * The object which satisfy this interface can be used for layouting. The codeflow when using the interface is as follows.
 * Call {@link prepareFromGraph} to prepare the layouting algorithm and then call {@link run} to layout based on the preparation.
 * It is also possible to call {@link runGeneralizationLayout} to layout the content the generalization subgraphs.
 */
export interface LayoutAlgorithm {

    /**
     * Prepares the algorithm for future layouting. The future layouting will layout given graph and use given constraints.
     */
    prepareFromGraph: (graph: Graph, constraintContainer: ConstraintContainer) => void,
    /**
     * Runs the layouting algorithm on the graph prepared earlier.
     * @param shouldCreateNewGraph if true then new graph is created, otherwise the one passed in preparation phase is changed in place
     * @returns promise which on resolve returns the layouted graph
     */
    run: (shouldCreateNewGraph: boolean) => Promise<MainGraph>,
    /**
     * Runs the layouting algorithm on the graph prepared earlier. Layouts only the generalizations subgraphs separately.
     * @param shouldCreateNewGraph if true then new graph is created, otherwise the one passed in preparation phase is changed in place
     * @returns promise which on resolve returns the layouted graph
     */
    // TODO: Again this could be generalized that we would layout list of any given subgraphs instead of the generalization subgraphs, so it should be moved one level up and
    //       we should just call layout on the given subgraph
    runGeneralizationLayout: (shouldCreateNewGraph: boolean) => Promise<MainGraph>,
}


export type EntityBundle = {
    sourceModelIdentifier: string,
    semanticEntity: SemanticModelEntity,
};

type ClassBundle = {
    sourceModelIdentifier: string,
    semanticClass: SemanticModelClass,
};

type ClassProfileBundle = {
    sourceModelIdentifier: string,
    semanticClassProfile: SemanticModelClassProfile
};

export type RelationshipBundle = {
    sourceModelIdentifier: string,
    semanticRelationship: SemanticModelRelationship,
};

export type RelationshipProfileBundle = {
    sourceModelIdentifier: string,
    semanticRelationshipProfile: SemanticModelRelationshipProfile,
};

export type GeneralizationBundle = {
    sourceModelIdentifier: string,
    semanticGeneralization: SemanticModelGeneralization,
};

type AttributeBundle = {
    sourceModelIdentifier: string,
    semanticRelationship: SemanticModelRelationship,
};


export interface ExtractedModels {
    entities: EntityBundle[],
    classes: ClassBundle[],
    classesProfiles: ClassProfileBundle[],
    relationships: RelationshipBundle[],
    relationshipsProfiles: RelationshipProfileBundle[],
    generalizations: GeneralizationBundle[],
    attributes: AttributeBundle[],
}

export type AllowedEdgeBundleTypes = RelationshipBundle | RelationshipProfileBundle | GeneralizationBundle | ClassProfileBundle;

/**
 * This interface defines methods for transformation between our graph representation and layouting library representation.
 */
export interface GraphTransformer {

    /** Expected call flow is as follows:
     * 1) Create graph representation of type {@link Graph}
     * 2) Call this method
     * 3) Perform layouting
     * 4) Update existing graph representation using {@link updateExistingGraphRepresentationBasedOnLibraryRepresentation}
     * (or create new one using {@link convertLibraryToGraphRepresentation}).
     * Created representations already include VisualModel in form of {@link VisualNodeComplete} on nodes
     * or just call {@link convertToDataspecerRepresentation} if you no longer need the graph structure
     */
    convertGraphToLibraryRepresentation(
        graph: Graph,
        shouldSetLayoutOptions: boolean,
        constraintContainer: ConstraintContainer
    ): object,

    /**
     * Converts library graph representation to our graph representation.
     * Creates new graph instance with positions set based on the values in library representation of the graph.
     */
    convertLibraryToGraphRepresentation(
        libraryRepresentation: object | null,
        includeDummies: boolean
    ): Graph,

    /**
     * Update positions of visual entities in our graph representation based on the positions in the layout library graph representation.
     */
    updateExistingGraphRepresentationBasedOnLibraryRepresentation(
        libraryRepresentation: object | null,
        graphToBeUpdated: Graph,
        includeNewVertices: boolean,
        shouldUpdateEdges: boolean
    ): void,
}


function filterForExtraction(entities: EntityBundle[], predicate: (resource: Entity | null) => boolean) {
    const values = entities.filter(({semanticEntity: semanticModelEntity}) => {
        return predicate(semanticModelEntity);
    });

    return values;
}

/**
 * Converts entities from given semantic model into concrete data types. Returns them in object of type {@link ExtractedModels}
 */
export function extractModelObjects(inputSemanticModels: Map<string, EntityModel>): ExtractedModels {
    const entitiesInModels: EntityBundle[][] = [...inputSemanticModels.entries()].map(([modelIdentifier, model]) => {
        return Object.entries(model.getEntities() as Record<string, SemanticModelEntity>).map(([key, value]) => ({
            sourceModelIdentifier: modelIdentifier,
            semanticEntity: value,
        }));
    });

    const entities: EntityBundle[] = [];
    entitiesInModels.forEach(model => {
        entities.push(...model);
    });

    const classes = filterForExtraction(entities, isSemanticModelClass).map((o) => {
        return {
            sourceModelIdentifier: o.sourceModelIdentifier,
            semanticClass: o.semanticEntity as SemanticModelClass,
        }
    });
    const classesProfiles = filterForExtraction(entities, isSemanticModelClassProfile).map((o) => {
        return {
            sourceModelIdentifier: o.sourceModelIdentifier,
            semanticClassProfile: o.semanticEntity as SemanticModelClassProfile,
        }
    });
    const relationshipsProfiles = filterForExtraction(entities, isSemanticModelRelationshipProfile).map((o) => {
        return {
            sourceModelIdentifier: o.sourceModelIdentifier,
            semanticRelationshipProfile: o.semanticEntity as unknown as SemanticModelRelationshipProfile,
        }
    });
    const generalizations = filterForExtraction(entities, isSemanticModelGeneralization).map((o) => {
        return {
            sourceModelIdentifier: o.sourceModelIdentifier,
            semanticGeneralization: o.semanticEntity as SemanticModelGeneralization,
        }
    });
    const attributes = filterForExtraction(entities, isSemanticModelAttribute).map((o) => {
        return {
            sourceModelIdentifier: o.sourceModelIdentifier,
            semanticRelationship: o.semanticEntity as SemanticModelRelationship,
        }
    });

    // TODO: Later take care of profiled attributes vs profile relationships in same way
    const relationships = entities
        .filter((o) => (isSemanticModelRelationship(o.semanticEntity) &&
                        !isSemanticModelAttribute(o.semanticEntity)))
            .map((o) => {
                return {
                    sourceModelIdentifier: o.sourceModelIdentifier,
                    semanticRelationship: o.semanticEntity as SemanticModelRelationship,
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
