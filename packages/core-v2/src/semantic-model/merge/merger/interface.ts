import { SemanticModelClass, SemanticModelRelationship } from "../../concepts";

/**
 * Merges same entities that have same id.
 * The same id is a requirement otherwise the surroundings of the given entity must be taken into account which is more complex issue.
 */
export interface SemanticEntityIdMerger {
  mergeClasses(classes: SemanticModelClass[]): SemanticModelClass;
  mergeRelationships(relationships: SemanticModelRelationship[]): SemanticModelRelationship;
}
