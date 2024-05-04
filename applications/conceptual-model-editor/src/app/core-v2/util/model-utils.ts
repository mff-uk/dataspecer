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
import { IRI } from "iri";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { shortenStringTo } from "./utils";

export const sourceModelOfEntity = (entityId: string, models: EntityModel[]) => {
    return models.find((m) => Object.keys(m.getEntities()).find((eId) => eId == entityId));
};

export const sourceModelIdOfEntity = (entityId: string, sourceMap: Map<string, string>) => {
    return sourceMap.get(entityId);
};

export const filterInMemoryModels = (models: EntityModel[]) => {
    return models.filter((m): m is InMemorySemanticModel => m instanceof InMemorySemanticModel);
};

export const getIri = (
    entity:
        | SemanticModelClass
        | SemanticModelClassUsage
        | SemanticModelRelationship
        | SemanticModelRelationshipUsage
        | SemanticModelGeneralization
        | null
        | undefined,
    modelBaseIri?: string
) => {
    if (!entity) {
        return null;
    }

    let iri: string | null;
    if (isSemanticModelClass(entity)) {
        iri = entity.iri;
    } else if (isSemanticModelRelationship(entity)) {
        const range = getDomainAndRange(entity)?.range;
        iri = range?.iri ?? null;
    } else if (isSemanticModelGeneralization(entity)) {
        iri = entity.iri;
    } else if (isSemanticModelClassUsage(entity)) {
        iri = (entity as SemanticModelClass & SemanticModelClassUsage)?.iri ?? null;
    } else if (isSemanticModelRelationshipUsage(entity)) {
        iri = temporaryDomainRangeHelper(entity)?.range?.iri ?? null;
    } else {
        iri = null;
    }

    if (!iri) {
        return null;
    }

    if (new IRI(iri).scheme()) {
        return iri;
    } else {
        return (modelBaseIri ?? "") + iri;
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

export const getModelType = (model: EntityModel | undefined | null) => {
    if (model instanceof InMemorySemanticModel) {
        return "local model";
    } else if (model instanceof ExternalSemanticModel) {
        return "external (sgov)";
    } else {
        return "from .ttl";
    }
};

export const getModelDetails = (model: EntityModel) => {
    const id = model.getId();
    const alias = model.getAlias();
    const type = getModelType(model);
    const baseIri = getModelIri(model);
    const displayName = alias ?? shortenStringTo(id ?? null);
    return {
        id,
        alias,
        type,
        baseIri,
        displayName,
    };
};
