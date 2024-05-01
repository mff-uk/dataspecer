import { Entity, EntityModel } from "@dataspecer/core-v2";
import {
    SemanticModelClass,
    SemanticModelEntity,
    SemanticModelRelationship,
    isSemanticModelClass,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

export const getTheOriginalProfiledEntity = (
    resource: SemanticModelClassUsage | SemanticModelRelationshipUsage,
    sources: (
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage
    )[]
): SemanticModelClass | SemanticModelRelationship | SemanticModelRelationshipUsage | SemanticModelClassUsage => {
    const profiledByThis = sources.find((e) => e.id == resource.usageOf) ?? null;
    if (isSemanticModelClassUsage(profiledByThis) || isSemanticModelRelationshipUsage(profiledByThis)) {
        return getTheOriginalProfiledEntity(profiledByThis, sources);
    } else if (isSemanticModelClass(profiledByThis) || isSemanticModelRelationship(profiledByThis)) {
        return profiledByThis;
    } else {
        return resource;
    }
};

export const getProfiledEntity = (
    resource: SemanticModelClassUsage | SemanticModelRelationshipUsage,
    sources: (
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage
    )[]
) => {
    return sources.find((e) => e.id == resource.usageOf) ?? null;
};

export const getFirstProfiledEntityToChangeIri = (
    resource: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage,
    sources: (
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage
    )[],
    rawEntities: (Entity | null)[],
    models: EntityModel[]
): SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | null => {
    if (isSemanticModelClass(resource) || isSemanticModelRelationship(resource)) {
        return resource;
    }
    // return getTheOriginalProfiledEntity(resource, sources);

    const rawResource = rawEntities.find((r) => r?.id == resource.id);
    if (!rawResource) {
        return null;
    }

    const rawIri = (rawResource as SemanticModelEntity)?.iri;

    if (rawIri) {
        return resource;
    }
    // no iri set, go to the profiled entity
    const itsProfiledEntity = getProfiledEntity(resource, sources);
    if (!itsProfiledEntity) {
        return null;
    }
    return getFirstProfiledEntityToChangeIri(itsProfiledEntity, sources, rawEntities, models);
};
