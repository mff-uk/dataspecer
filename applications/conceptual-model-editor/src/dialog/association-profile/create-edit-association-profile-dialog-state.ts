
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { EntityModel } from "@dataspecer/core-v2";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAssociationProfileDialogState } from "./edit-association-profile-dialog-controller";
import { EntityModelRepresentative, EntityRepresentative, InvalidEntity, isRepresentingAssociation, RelationshipRepresentative, representCardinalities, representCardinality, representClasses, representClassProfiles, representModel, representModels, representOwlThing, representRelationshipProfiles, representRelationships, representUndefinedCardinality, selectWritableModels, sortRepresentatives } from "../utilities/dialog-utilities";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { getDomainAndRange } from "../../util/relationship-utils";
import { getModelIri } from "../../util/iri-utils";
import { isRelativeIri } from "../utilities/entity-utilities";
import { validationNoProblem } from "../utilities/validation-utilities";
import { createLogger } from "../../application";

const LOG = createLogger(import.meta.url);

/**
 * @param classesContext
 * @param graphContext
 * @param visualModel
 * @param language
 * @param entity Entity to edit.
 * @param semanticModel Model containing the association profile.
 * @returns
 */
export function createEditAssociationProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  entity: SemanticModelRelationshipUsage,
  semanticModel: InMemorySemanticModel,
): EditAssociationProfileDialogState {
  const models = [...graphContext.models.values()];
  const availableModels = representModels(visualModel, models);
  const writableModels = representModels(visualModel, selectWritableModels(models));
  const model = representModel(visualModel, semanticModel);

  const entities = graphContext.aggregatorView.getEntities();

  // Prepare list of associations and class profiles we can profile.
  const availableProfiles = sanitizeDuplicitiesInRepresentativeLabels(availableModels, [
    ...representRelationships(models,
      classesContext.relationships),
    ...representRelationshipProfiles(entities, models,
      classesContext.profiles.filter(item => isSemanticModelRelationshipUsage(item))),
  ]).filter(isRepresentingAssociation)
    .filter(item => item.identifier !== entity.id);
  sortRepresentatives(language, availableProfiles);

  // Prepare list of class profiles we can profile.
  const availableClassProfiles = sanitizeDuplicitiesInRepresentativeLabels(availableModels, [
    ...representClassProfiles(entities, models,
      classesContext.profiles.filter(item => isSemanticModelClassUsage(item))),
  ]);
  sortRepresentatives(language, availableProfiles);

  // Find representation of profiled entity.
  const profileOf =
    availableProfiles.find(item => item.identifier === entity.usageOf)
    ?? null;

  if (profileOf === null) {
    LOG.invalidEntity(entity.id, "Entity to profile is not part of available profiles!");
    throw new InvalidEntity(entity);
  }

  return createForAssociationProfile(
    language, availableModels, writableModels, model, entities,
    entity, availableProfiles, profileOf, availableClassProfiles)
}


function createForAssociationProfile(
  language: string,
  availableModels: EntityModelRepresentative<EntityModel>[],
  writableModels: EntityModelRepresentative<InMemorySemanticModel>[],
  model: EntityModelRepresentative<InMemorySemanticModel>,
  entities: Record<string, AggregatedEntityWrapper>,
  entity: SemanticModelRelationshipUsage,
  availableProfiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  availableClassProfiles: EntityRepresentative[],
): EditAssociationProfileDialogState {
  const aggregated = entities[entity.id]?.aggregatedEntity;
  if (!isSemanticModelRelationshipUsage(aggregated)) {
    LOG.invalidEntity(entity.id, "Aggregated property type does not match the entity type!");
    throw new InvalidEntity(entity);
  }

  const owlThing = representOwlThing();

  const { domain, range } = getDomainAndRange(entity);
  const { domain: aggregatedDomain, range: aggregatedRange } = getDomainAndRange(aggregated);

  const domainRepresentation = availableClassProfiles
    .find(item => item.identifier === aggregatedDomain?.concept) ?? owlThing;

  const rangeRepresentation = availableClassProfiles
    .find(item => item.identifier === aggregatedRange?.concept) ?? owlThing;

  const availableCardinalities = [...representCardinalities()];

  // There may be no cardinality for inherited value.
  // We need a default, when user switch to inherit value.
  const domainCardinality = aggregatedDomain?.cardinality === null ?
    availableCardinalities[0] : representCardinality(aggregatedDomain?.cardinality);
  const rangeCardinality = aggregatedRange?.cardinality === null ?
    availableCardinalities[0] : representCardinality(aggregatedRange?.cardinality);
  console.log({ domain: aggregatedDomain, range: aggregatedRange });
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
    overrideName: isOverridden(range?.name),
    description: aggregatedRange?.description ?? {},
    overrideDescription: isOverridden(range?.description),
    availableProfiles,
    profileOf,
    usageNote: aggregatedRange?.usageNote ?? {},
    overrideUsageNote: isOverridden(range?.usageNote),
    disableOverrideUsageNote: false,
    domain: domainRepresentation,
    initialDomain: domainRepresentation,
    overrideDomain: isOverridden(domain?.concept),
    domainValidation: validationNoProblem(),
    domainCardinality,
    initialDomainCardinality: domainCardinality,
    domainCardinalityValidation: validationNoProblem(),
    overrideDomainCardinality: isOverridden(domain?.cardinality),
    availableDomainItems: [owlThing, ...availableClassProfiles],
    range: rangeRepresentation,
    initialRange: rangeRepresentation,
    overrideRange: isOverridden(range?.concept),
    rangeValidation: validationNoProblem(),
    rangeCardinality,
    initialRangeCardinality: rangeCardinality,
    overrideRangeCardinality: isOverridden(range?.cardinality),
    rangeCardinalityValidation: validationNoProblem(),
    availableRangeItems: [owlThing, ...availableClassProfiles],
    availableCardinalities: [representUndefinedCardinality(), ...representCardinalities()],
  };
}

function isOverridden<T>(value: T | null | undefined): boolean {
  return value !== null && value !== undefined;
}
