import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import {
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
    isSemanticModelClass,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

export const sourceModelOfEntity = (entityId: string, models: EntityModel[]) => {
    return models.find((m) => Object.keys(m.getEntities()).find((eId) => eId == entityId));
};

export const sourceModelIdOfEntity = (entityId: string, sourceMap: Map<string, string>) => {
    return sourceMap.get(entityId);
};

export const getIri = (
    entity:
        | SemanticModelClass
        | SemanticModelClassUsage
        | SemanticModelRelationship
        | SemanticModelRelationshipUsage
        | SemanticModelGeneralization
        | null
) => {
    if (isSemanticModelClass(entity)) {
        return entity.iri;
    } else if (isSemanticModelRelationship(entity)) {
        const domain = getDomainAndRange(entity)?.domain;
        return domain?.iri ?? null;
    } else {
        return null;
    }
};

export const getModelIri = (model: EntityModel | undefined | null) => {
    return `https://my-model-${model?.getId() ?? "undefined-model"}.iri.todo.com/entities/`;
};
