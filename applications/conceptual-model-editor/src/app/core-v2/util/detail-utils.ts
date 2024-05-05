import {
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
    isSemanticModelClass,
    isSemanticModelGeneralization,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { getLocalizedStringFromLanguageString } from "./language-utils";
import {
    getDescriptionLanguageString,
    getFallbackDisplayName,
    getNameLanguageString,
    getUsageNoteLanguageString,
} from "./name-utils";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getIri, getModelIri, sourceModelOfEntity } from "./model-utils";
import { useModelGraphContext } from "../context/model-context";
import { useClassesContext } from "../context/classes-context";
import { getProfiledEntity, getTheOriginalProfiledEntity } from "./profile-utils";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import { temporaryDomainRangeHelper } from "./relationship-utils";
import { cardinalityToString } from "./utils";
import { dataTypeUriToName, isDataType } from "@dataspecer/core-v2/semantic-model/datatypes";

export type EntityDetailSupportedType =
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassUsage
    | SemanticModelRelationshipUsage
    | SemanticModelGeneralization;

export interface EntityDetailProxy {
    name: string | null;
    description: string | null;
    iri: string | null;
    usageNote: string | null;
    specializationOf: SemanticModelClass[];
    generalizationOf: SemanticModelClass[];
    profileOf:
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage
        | undefined;
    originalProfile:
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage
        | undefined;
    profiledBy: (
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage
    )[];
    attributes: SemanticModelRelationship[];
    attributeProfiles: SemanticModelRelationshipUsage[];
    domain: {
        entity: SemanticModelClass | SemanticModelClassUsage | SemanticModelRelationshipUsage | undefined;
        cardinality: string | undefined;
    };
    range: {
        entity: SemanticModelClass | SemanticModelClassUsage | SemanticModelRelationshipUsage | undefined;
        cardinality: string | undefined;
    };
    datatype: {
        label: string | null;
        uri: string;
    } | null;
    canHaveAttributes: boolean;
    canHaveDomainAndRange: boolean;
}

export const EntityProxy = (viewedEntity: EntityDetailSupportedType, currentLang?: string) => {
    const { classes2: c, relationships: r, profiles, generalizations } = useClassesContext();
    const { models: m } = useModelGraphContext();
    const models = [...m.values()];
    const sourceModel = sourceModelOfEntity(viewedEntity.id, models);
    const profilingSources = [...c, ...r, ...profiles];

    const proxy = new Proxy(viewedEntity as unknown as EntityDetailProxy, {
        get: (obj, property) => {
            if (property === "name") {
                return getName();
            } else if (property === "description") {
                return getDescription();
            } else if (property === "usageNote") {
                return getUsageNote();
            } else if (property === "iri") {
                return getEntityIri();
            } else if (property === "specializationOf") {
                return getSpecializationOf();
            } else if (property === "generalizationOf") {
                return getGeneralizationOf();
            } else if (property === "profileOf") {
                return isProfileOf();
            } else if (property === "originalProfile") {
                return theOriginalProfiledEntity();
            } else if (property === "profiledBy") {
                return isProfiledBy();
            } else if (property === "attributes") {
                return getAttributes();
            } else if (property === "attributeProfiles") {
                return getAttributeProfiles();
            } else if (property === "domain") {
                return getDomain();
            } else if (property === "range") {
                return getRange();
            } else if (property === "canHaveAttributes") {
                return canHaveAttributes();
            } else if (property === "canHaveDomainAndRange") {
                return canHaveDomainAndRange();
            } else if (property === "datatype") {
                return getDataType();
            }
        },
    });

    const getName = () =>
        getLocalizedStringFromLanguageString(getNameLanguageString(viewedEntity), currentLang) ??
        getFallbackDisplayName(viewedEntity);

    const getDescription = () =>
        getLocalizedStringFromLanguageString(getDescriptionLanguageString(viewedEntity), currentLang);

    const getUsageNote = () =>
        getLocalizedStringFromLanguageString(getUsageNoteLanguageString(viewedEntity), currentLang);

    const getEntityIri = () => getIri(viewedEntity, getModelIri(sourceModel));

    const getSpecializationOf = () =>
        generalizations
            .filter((g) => g.child == viewedEntity.id)
            .map((g) => c.find((cl) => cl.id == g.parent))
            .filter((cl) => isSemanticModelClass(cl ?? null))
            .filter((cl): cl is SemanticModelClass => cl != undefined);

    const getGeneralizationOf = () =>
        generalizations
            .filter((g) => g.parent == viewedEntity.id)
            .map((g) => c.find((cl) => cl.id == g.child))
            .filter((cl) => isSemanticModelClass(cl ?? null))
            .filter((cl): cl is SemanticModelClass => cl != undefined);

    const isProfileOf = () =>
        isSemanticModelClassUsage(viewedEntity) || isSemanticModelRelationshipUsage(viewedEntity)
            ? profilingSources.find((e) => e.id == viewedEntity.usageOf)
            : undefined;

    const theOriginalProfiledEntity = () =>
        isSemanticModelClassUsage(viewedEntity) || isSemanticModelRelationshipUsage(viewedEntity)
            ? getTheOriginalProfiledEntity(viewedEntity, profilingSources)
            : undefined;

    const isProfiledBy = () =>
        profiles
            .filter((p) => p.usageOf == viewedEntity.id)
            .map((p) => profilingSources.find((e) => e.id == p.id))
            .filter(
                (
                    p
                ): p is
                    | SemanticModelClass
                    | SemanticModelRelationship
                    | SemanticModelRelationshipUsage
                    | SemanticModelClassUsage => p != undefined
            );

    let ends: { domain: SemanticModelRelationshipEnd; range: SemanticModelRelationshipEnd } | null = null;
    if (isSemanticModelRelationship(viewedEntity)) {
        ends = getDomainAndRange(viewedEntity);
    } else if (isSemanticModelRelationshipUsage(viewedEntity)) {
        ends = temporaryDomainRangeHelper(viewedEntity);
    } else if (isSemanticModelGeneralization(viewedEntity)) {
        ends = {
            domain: {
                concept: viewedEntity.child,
                name: { en: "Generalization child" },
                description: {},
                iri: null,
            } as SemanticModelRelationshipEnd,
            range: {
                concept: viewedEntity.parent,
                name: { en: "Generalization parent" },
                description: {},
                iri: null,
            } as SemanticModelRelationshipEnd,
        };
    }

    const getAttributes = () =>
        r.filter(isSemanticModelAttribute).filter((v) => v.ends.at(0)?.concept == viewedEntity.id);
    const getAttributeProfiles = () =>
        profiles
            .filter(isSemanticModelRelationshipUsage)
            .filter((a) =>
                isSemanticModelAttributeUsage(a as SemanticModelRelationshipUsage & SemanticModelRelationship)
            )
            .filter((v) => temporaryDomainRangeHelper(v)?.domain.concept == viewedEntity.id);

    const getDomain = () => ({
        entity: c.find((cls) => cls.id == ends?.domain?.concept) ?? profiles.find((v) => v.id == ends?.domain?.concept),
        cardinality: cardinalityToString(ends?.domain?.cardinality),
    });

    const getRange = () => ({
        entity: c.find((cls) => cls.id == ends?.range.concept) ?? profiles.find((v) => v.id == ends?.range?.concept),
        cardinality: cardinalityToString(ends?.range?.cardinality),
    });

    const getDataType = () => {
        if (!(isSemanticModelAttribute(viewedEntity) || isSemanticModelAttributeUsage(viewedEntity))) {
            return null;
        }
        const concept = ends?.range.concept ?? null;
        if (isDataType(concept)) {
            return {
                label: dataTypeUriToName(concept),
                uri: concept,
            };
        }
        return null;
    };

    const canHaveAttributes = () => isSemanticModelClass(viewedEntity) || isSemanticModelClassUsage(viewedEntity);
    const canHaveDomainAndRange = () =>
        isSemanticModelRelationship(viewedEntity) || isSemanticModelRelationshipUsage(viewedEntity);

    return proxy;
};

export const getEntityTypeString = (entity: EntityDetailSupportedType | null) => {
    if (!entity) {
        return "no type";
    }
    if (isSemanticModelAttribute(entity)) {
        return "relationship (attribute)";
    } else if (isSemanticModelAttributeUsage(entity)) {
        return "relationship profile (attribute)";
    } else if (isSemanticModelClassUsage(entity)) {
        return "class profile";
    } else if (isSemanticModelRelationshipUsage(entity)) {
        return "relationship profile";
    } else {
        return entity.type[0];
    }
};
