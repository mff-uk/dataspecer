import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import {
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
    isSemanticModelClass,
    isSemanticModelGeneralization,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { temporaryDomainRangeHelper } from "./relationship-utils";

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
        const range = getDomainAndRange(entity)?.range;
        return range?.iri ?? null;
    } else if (isSemanticModelGeneralization(entity)) {
        return entity.iri;
    } else if (isSemanticModelClassUsage(entity)) {
        return (entity as SemanticModelClass & SemanticModelClassUsage)?.iri ?? null;
    } else if (isSemanticModelRelationshipUsage(entity)) {
        return temporaryDomainRangeHelper(entity)?.range?.iri ?? null;
    } else {
        return null;
    }
};

export const getModelIri = (model: EntityModel | undefined | null) => {
    // console.log("getting base iri", model);
    if (model instanceof InMemorySemanticModel) {
        if (model.getBaseIri()?.length > 0) {
            return model.getBaseIri();
        }
        return `https://my-model-${model?.getId() ?? "undefined-model"}.iri.todo.com/entities/`;
    }
    return "";
};
