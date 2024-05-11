import {
    SemanticModelClass,
    SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { VisualEntityModel } from "@dataspecer/core-v2/visual-model";

export const getCurrentVisibilityOnCanvas = (
    entities: (
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage
    )[],
    visualModel: VisualEntityModel | null
) => {
    const getDefaultVisibility = () => {
        if (isSemanticModelClass(entities[0] ?? null) || isSemanticModelClassUsage(entities[0] ?? null)) {
            return false;
        }
        return true;
    };

    return entities.map((e) => [e.id, visualModel?.getVisualEntity(e.id)?.visible ?? getDefaultVisibility()] as const);
};
