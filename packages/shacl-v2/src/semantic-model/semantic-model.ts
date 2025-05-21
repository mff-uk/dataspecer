import { EntityModel } from "@dataspecer/core-v2";

export {
  SEMANTIC_MODEL_CLASS,
  isSemanticModelClass,
  type SemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts"

export {
  SEMANTIC_MODEL_RELATIONSHIP,
  isSemanticModelRelationship,
  type SemanticModelRelationship,
  type SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts"

export {
  SEMANTIC_MODEL_GENERALIZATION,
  isSemanticModelGeneralization,
  type SemanticModelGeneralization,
} from "@dataspecer/core-v2/semantic-model/concepts"

export type SemanticModel = EntityModel;
