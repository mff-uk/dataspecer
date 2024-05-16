import { VisualEntities, VisualEntity } from "../../core-v2/lib/visual-model/visual-entity";

import { SemanticModelEntity, isSemanticModelClass, isSemanticModelRelationship, isSemanticModelGeneralization,
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute
 } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage,
         SemanticModelClassUsage, SemanticModelRelationshipUsage
 } from "@dataspecer/core-v2/semantic-model/usage/concepts";

 import { IGraphClassic, IVisualEntityComplete } from "./graph-iface";


export type LayoutMethod = (inputSemanticModel: Record<string, SemanticModelEntity>, options?: object) => Promise<VisualEntities>


export interface ExtractedModel {
    entities: SemanticModelEntity[],
    classes: SemanticModelClass[],
    classesProfiles: SemanticModelClassUsage[],
    relationships: SemanticModelRelationship[],
    relationshipsProfiles: SemanticModelRelationshipUsage[],
    generalizations: SemanticModelGeneralization[],
    attributes: SemanticModelRelationship[],
}


// TODO: Maybe it makes more sense to make the interface a abstract class instead 
export interface GraphTransformer {
    /** Expected call flow is as follows: 
     * 1) Get {@link ExtractedModel} from provided model
     * 2) Call this method
     * 3) Perform layouting
     * 4) Convert layouted elements to {@link VisualEntities} using {@link convertToDataspecerRepresentation}, these elements can then be shown in cme (conceptual model editor).
     * @deprecated (not deprecated yet though) Use {@link convertGraphToLibraryRepresentation} instead */
    convertToLibraryRepresentation(extractedModel: ExtractedModel, options?: object): object,     
    convertToDataspecerRepresentation(libraryRepresentation: object): VisualEntities,


    /** Expected call flow is as follows:      
     * 1) Create graph representation of type {@link IGraphClassic}
     * 2) Call this method
     * 3) Perform layouting
     * 4) Update existing graph representation using {@link updateExistingGraphRepresentationBasedOnLibraryRepresentation} (or create new one using {@link convertLibraryToGraphRepresentation}). Created representations already include VisualModel in form of {@link IVisualEntityComplete} on nodes
     * or just call {@link convertToDataspecerRepresentation} if you no longer need the graph structure     
     */
    convertGraphToLibraryRepresentation(graph: IGraphClassic, options?: object): object, 
    convertLibraryToGraphRepresentation(libraryRepresentation: object, includeDummies: boolean): IGraphClassic,
    updateExistingGraphRepresentationBasedOnLibraryRepresentation(libraryRepresentation: object, graphToBeUpdated: IGraphClassic, includeNewVertices: boolean): void,
}


export function extractModelObjects(inputSemanticModel: Record<string, SemanticModelEntity>): ExtractedModel {    
    const entities = Object.values(inputSemanticModel);    
    const classes = entities.filter(isSemanticModelClass);
    // TODO: This "as unknown as ..." feels weird, but it should be correct, the main difference is that there is missing IRI in the profiles.
    //       Since they have as parent only Entity and not SemanticModelEntity
    const classesProfiles = entities.filter(isSemanticModelClassUsage).map(cp => cp as unknown as SemanticModelClassUsage);
    const relationshipsProfiles = entities.filter(isSemanticModelRelationshipUsage).map(rp => rp as unknown as SemanticModelRelationshipUsage);    
    const generalizations = entities.filter(isSemanticModelGeneralization);
    const attributes = entities.filter(isSemanticModelAttribute);

    // Semi TODO:
    // For some reason have to perform the mapping even though both methods clearly state that instances are of type SemanticModelRelationship
    // TODO: Later take care of profiled attributes vs profile relationships in same way
    const relationships = entities.filter(r => (isSemanticModelRelationship(r) && !isSemanticModelAttribute(r))).map(r => r as SemanticModelRelationship);
    

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


export function getEdgeSourceAndTargetRelationship(relationship: SemanticModelRelationship): [string, string, number, number] {
    let source, target: string;    
    let sourceIndex, targetIndex: number;
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

    return [source, target, sourceIndex, targetIndex];
}

export function getEdgeSourceAndTargetRelationshipUsage(relationship: SemanticModelRelationshipUsage): [string, string] {
    let source, target: string;
    
    // TODO: For now just rely on the order, fix later
    source = relationship.ends[0].concept;
    target = relationship.ends[1].concept;
    // if(relationship.ends[0].iri == null) {
    //     source = relationship.ends[0].concept;
    //     target = relationship.ends[1].concept;
    // }
    // else {
    //     source = relationship.ends[1].concept;
    //     target = relationship.ends[0].concept;
    // }

    return [source, target];
}

export function getEdgeSourceAndTargetGeneralization(relationship: SemanticModelGeneralization): [string, string] {
    return [relationship.child, relationship.parent];
}