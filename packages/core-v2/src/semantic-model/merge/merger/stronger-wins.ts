import { SemanticModelClass, SemanticModelRelationship } from "../../concepts";
import { SemanticEntityIdMerger } from "./interface";

function compareVectors(a: number[], b: number[]) {
  for (let i = 0; i < a.length; i++) {
    if (a[i]! < b[i]!) {
      return 1;
    } else if (a[i]! > b[i]!) {
      return -1;
    }
  }
  return 0;
}

/**
 * Takes into account only the entity (as a whole) with stronger semantics.
 */
export class StrongerWinsSemanticEntityIdMerger implements SemanticEntityIdMerger {
  mergeClasses(classes: SemanticModelClass[]): SemanticModelClass {
    const vectors = classes.map((cls) => [
      cls,
      [
        Object.values(cls?.name ?? {}).length, // Number of names
        Object.values(cls?.description ?? {}).length, // Number of descriptions
      ],
    ]) as [SemanticModelClass, number[]][];
    // Sort as vectors
    vectors.sort((a, b) => compareVectors(a[1], b[1]));

    return vectors[0]![0];
  }

  mergeRelationships(relationships: SemanticModelRelationship[]): SemanticModelRelationship {
    const vectors = relationships.map((relationship) => [
      relationship,
      [
        Object.values(relationship.ends[1]?.name ?? {}).length, // Number of names
        Object.values(relationship.ends[1]?.description ?? {}).length, // Number of descriptions
        Object.values(relationship.ends[0]?.name ?? {}).length, // Number of names
        Object.values(relationship.ends[0]?.description ?? {}).length, // Number of descriptions
      ],
    ]) as [SemanticModelRelationship, number[]][];

    // Sort as vectors
    vectors.sort((a, b) => compareVectors(a[1], b[1]));

    return vectors[0]![0];
  }
}
