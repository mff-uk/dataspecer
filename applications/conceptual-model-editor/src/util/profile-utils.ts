import {
  type SemanticModelClass,
  type SemanticModelRelationship,
  isSemanticModelClass,
  isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  type SemanticModelClassUsage,
  type SemanticModelRelationshipUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { type EntityDetailSupportedType } from "./detail-utils";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

export const isSemanticProfile = (
  resource: EntityDetailSupportedType | null
): resource is SemanticModelClassUsage | SemanticModelRelationshipUsage => {
  if (isSemanticModelClassUsage(resource) || isSemanticModelRelationshipUsage(resource)) {
    return true;
  }
  return false;
};

export const getTheOriginalProfiledEntity = (
  resource:
    SemanticModelClassUsage
    | SemanticModelRelationshipUsage
    | SemanticModelClassProfile
    | SemanticModelRelationshipProfile,
  sources: (
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassUsage
    | SemanticModelRelationshipUsage
    | SemanticModelClassProfile
    | SemanticModelRelationshipProfile
  )[]
): (SemanticModelClass | SemanticModelRelationship)[] => {
  let profiling: string[] = [];
  if (isSemanticModelClassUsage(resource) || isSemanticModelRelationshipUsage(resource)) {
    profiling = [resource.usageOf];
  } else if (isSemanticModelClassProfile(resource)) {
    profiling = resource.profiling;
  } else if (isSemanticModelRelationshipProfile(resource)) {
    resource.ends.forEach(item => profiling.push(...item.profiling));
  }
  const result : (SemanticModelClass | SemanticModelRelationship) [] = [];
  profiling.map(identifier => sources.find(item => item.id === identifier))
    .filter(item => item !== undefined)
    .forEach(item => {
      if (isSemanticModelClass(item) || isSemanticModelRelationship(item)) {
        result.push(item);
      } else {
        result.push(...getTheOriginalProfiledEntity(resource, sources));
      }
    });
  // Make it uniq.
  return [...new Set(result)];
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
  return sources.find((e) => e.id === resource.usageOf) ?? null;
};

export type OverriddenFieldsType = {
  name: boolean;
  description: boolean;
  domain: boolean;
  domainCardinality: boolean;
  range: boolean;
  rangeCardinality: boolean;
};
export const getDefaultOverriddenFields = (): OverriddenFieldsType => ({
  name: false,
  description: false,
  domain: false,
  domainCardinality: false,
  range: false,
  rangeCardinality: false,
});

export type WithOverrideHandlerType = {
  callback: () => void;
  defaultValue: boolean;
};
