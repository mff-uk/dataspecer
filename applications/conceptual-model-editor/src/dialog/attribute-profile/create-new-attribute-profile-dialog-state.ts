
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelRelationship, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { EntityModel } from "@dataspecer/core-v2";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EntityModelRepresentative, EntityRepresentative, InvalidEntity, isRepresentingAttribute, RelationshipRepresentative, representCardinalities, representCardinality, representClasses, representClassProfiles, representDataTypes, representModel, representModels, representOwlThing, representRelationshipProfiles, representRelationships, representUndefinedCardinality, representUndefinedDataType, selectWritableModels, sortRepresentatives } from "../utilities/dialog-utilities";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { getDomainAndRange } from "../../util/relationship-utils";
import { getModelIri } from "../../util/iri-utils";
import { isRelativeIri } from "../utilities/entity-utilities";
import { validationNoProblem } from "../utilities/validation-utilities";
import { createLogger } from "../../application";
import { EditAttributeProfileDialogState } from "./edit-attribute-profile-dialog-controller";

const LOG = createLogger(import.meta.url);

/**
 * @param classesContext
 * @param graphContext
 * @param visualModel
 * @param language
 * @param entity Raw entity to create profile for.
 * @returns
 */
export function createNewAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  entity: SemanticModelRelationship | SemanticModelRelationshipUsage,
): EditAttributeProfileDialogState {
  const models = [...graphContext.models.values()];
  const availableModels = representModels(visualModel, models);
  const writableModels = representModels(visualModel, selectWritableModels(models));
  const model = writableModels[0];

  const entities = graphContext.aggregatorView.getEntities();

  // Prepare list of Attributes and class profiles we can profile.
  const availableProfiles = sanitizeDuplicitiesInRepresentativeLabels(availableModels, [
    ...representRelationships(models,
      classesContext.relationships),
    ...representRelationshipProfiles(entities, models,
      classesContext.profiles.filter(item => isSemanticModelRelationshipUsage(item))),
  ]).filter(isRepresentingAttribute);
  sortRepresentatives(language, availableProfiles);

  // Prepare list of class profiles we can profile.
  const availableClassProfiles = sanitizeDuplicitiesInRepresentativeLabels(availableModels, [
    ...representClassProfiles(entities, models,
      classesContext.profiles.filter(item => isSemanticModelClassUsage(item))),
  ]);
  sortRepresentatives(language, availableProfiles);

  // Find representation of entity to profile.
  const profileOf =
    availableProfiles.find(item => item.identifier === entity.id)
    ?? availableProfiles[0]
    ?? null;

  if (profileOf === null) {
    LOG.invalidEntity(entity.id, "No entity to profile!");
    throw new InvalidEntity(entity);
  }

  // Rest of this function depends of what we are profiling.
  if (isSemanticModelRelationship(entity)) {
    return createForAttribute(
      language, availableModels, writableModels, model,
      entity, availableProfiles, profileOf, availableClassProfiles);
  } else {
    return createForAttributeProfile(
      language, availableModels, writableModels, model, entities,
      entity, availableProfiles, profileOf, availableClassProfiles)
  }
}

function createForAttribute(
  language: string,
  availableModels: EntityModelRepresentative<EntityModel>[],
  writableModels: EntityModelRepresentative<InMemorySemanticModel>[],
  model: EntityModelRepresentative<InMemorySemanticModel>,
  entity: SemanticModelRelationship,
  availableProfiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  availableClassProfiles: EntityRepresentative[],
): EditAttributeProfileDialogState {
  const owlThing = representOwlThing();

  const undefinedDataTyp = representUndefinedDataType();
  const availableDataTypes = [undefinedDataTyp, ...representDataTypes()];
  sortRepresentatives(language, availableDataTypes);

  const { domain, range } = getDomainAndRange(entity);

  const domainRepresentation = availableClassProfiles
    .find(item => item.identifier === domain?.concept) ?? owlThing;

  const rangeRepresentation = availableDataTypes
    .find(item => item.identifier === range?.concept) ?? undefinedDataTyp;

  const domainCardinality = representCardinality(domain?.cardinality);

  const rangeCardinality = representCardinality(range?.cardinality);

  return {
    language,
    availableModels,
    writableModels,
    model,
    iri: range?.iri ?? "",
    iriPrefix: getModelIri(model.model),
    isIriAutogenerated: false,
    isIriRelative: isRelativeIri(range?.iri),
    name: range?.name ?? {},
    overrideName: false,
    description: range?.description ?? {},
    overrideDescription: false,
    availableProfiles,
    profileOf,
    usageNote: {},
    overrideUsageNote: true,
    disableOverrideUsageNote: true,
    domain: domainRepresentation,
    initialDomain: domainRepresentation,
    overrideDomain: false,
    domainValidation: validationNoProblem(),
    domainCardinality,
    initialDomainCardinality: domainCardinality,
    overrideDomainCardinality: false,
    domainCardinalityValidation: validationNoProblem(),
    availableDomainItems: [owlThing, ...availableClassProfiles],
    range: rangeRepresentation,
    initialRange: rangeRepresentation,
    overrideRange: false,
    rangeValidation: validationNoProblem(),
    rangeCardinality,
    initialRangeCardinality: rangeCardinality,
    overrideRangeCardinality: false,
    rangeCardinalityValidation: validationNoProblem(),
    availableRangeItems: availableDataTypes,
    availableCardinalities: [representUndefinedCardinality(), ...representCardinalities()],
  };
}

function createForAttributeProfile(
  language: string,
  availableModels: EntityModelRepresentative<EntityModel>[],
  writableModels: EntityModelRepresentative<InMemorySemanticModel>[],
  model: EntityModelRepresentative<InMemorySemanticModel>,
  entities: Record<string, AggregatedEntityWrapper>,
  entity: SemanticModelRelationshipUsage,
  availableProfiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  availableClassProfiles: EntityRepresentative[],
): EditAttributeProfileDialogState {
  const aggregated = entities[entity.id]?.aggregatedEntity;
  if (!isSemanticModelRelationshipUsage(aggregated)) {
    LOG.invalidEntity(entity.id, "Aggregated property type does not match the entity type!");
    throw new InvalidEntity(entity);
  }

  const undefinedDataTyp = representUndefinedDataType();
  const availableDataTypes = [undefinedDataTyp, ...representDataTypes()];
  sortRepresentatives(language, availableDataTypes);

  const owlThing = representOwlThing();

  const { domain: aggregatedDomain, range: aggregatedRange } = getDomainAndRange(aggregated);

  const domainRepresentation = availableClassProfiles
    .find(item => item.identifier === aggregatedDomain?.concept) ?? owlThing;

  const rangeRepresentation = availableDataTypes
    .find(item => item.identifier === aggregatedRange?.concept) ?? undefinedDataTyp;

  const availableCardinalities = [...representCardinalities()];

  // There may be no cardinality for inherited value.
  // We need a default, when user switch to inherit value.
  const domainCardinality = aggregatedDomain?.cardinality === null ?
    availableCardinalities[0] : representCardinality(aggregatedDomain?.cardinality);
  const rangeCardinality = aggregatedRange?.cardinality === null ?
    availableCardinalities[0] : representCardinality(aggregatedRange?.cardinality);

  return {
    language,
    availableModels,
    writableModels,
    model,
    iri: aggregatedRange?.iri ?? "",
    iriPrefix: getModelIri(model.model),
    isIriAutogenerated: false,
    isIriRelative: isRelativeIri(aggregatedRange?.iri),
    name: aggregatedRange?.name ?? {},
    overrideName: false,
    description: aggregatedRange?.description ?? {},
    overrideDescription: false,
    availableProfiles,
    profileOf,
    usageNote: {},
    overrideUsageNote: false,
    disableOverrideUsageNote: false,
    domain: domainRepresentation,
    initialDomain: domainRepresentation,
    overrideDomain: false,
    domainValidation: validationNoProblem(),
    domainCardinality,
    initialDomainCardinality: domainCardinality,
    domainCardinalityValidation: validationNoProblem(),
    overrideDomainCardinality: false,
    availableDomainItems: [owlThing, ...availableClassProfiles],
    range: rangeRepresentation,
    initialRange: rangeRepresentation,
    overrideRange: false,
    rangeValidation: validationNoProblem(),
    rangeCardinality,
    initialRangeCardinality: rangeCardinality,
    overrideRangeCardinality: false,
    rangeCardinalityValidation: validationNoProblem(),
    availableRangeItems: availableDataTypes,
    availableCardinalities: [representUndefinedCardinality(), ...representCardinalities()],
  };
}
