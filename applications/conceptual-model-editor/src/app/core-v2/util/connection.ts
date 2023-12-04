import { SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";

export type ConnectionType =
    | {
          connectionType: "association";
          ends: SemanticModelRelationshipEnd[];
      }
    | {
          connectionType: "generalization";
          childEntityId: string;
          parentEntityId: string;
      };
