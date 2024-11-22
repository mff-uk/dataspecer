import { useMemo } from "react";

import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualModel } from "@dataspecer/core-v2/visual-model";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { configuration } from "../../application";
import { getModelIri } from "../../util/iri-utils";
import { DialogProps } from "../dialog-api";
import { createCreateEntityController, createEntityController, CreateEntityState, CreateEntityStateController, EntityState, EntityStateController, isRelativeIri } from "../utilities/entity-utilities";
import { createProfileController, ProfileState, ProfileStateController } from "../utilities/profile-utilities";
import { Cardinality, EntityRepresentative, isRepresentingAttribute, representCardinalities, representCardinality, representClasses, representClassProfiles, representModels, representOwlThing, representRelationshipProfiles, representRelationships, representUndefinedCardinality, representUndefinedClass, selectWritableModels, sortRepresentatives } from "../utilities/dialog-utilities";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { getDomainAndRange } from "../../util/relationship-utils";

export interface CreateAssociationProfileDialogState extends EntityState, CreateEntityState, ProfileState {

  language: string;

  overrideName: boolean;

  overrideDescription: boolean;

  /**
   * Domain.
   */
  domain: EntityRepresentative;

  overrideDomain: boolean;

  /**
   * Domain cardinality.
   */
  domainCardinality: Cardinality;

  overrideDomainCardinality: boolean;

  /**
   * Available domain items.
   */
  availableDomainItems: EntityRepresentative[];

  /**
   * Range.
   */
  range: EntityRepresentative;

  overrideRange: boolean;

  /**
   * Range cardinality.
   */
  rangeCardinality: Cardinality;

  overrideRangeCardinality: boolean;

  /**
   * Available range items.
   */
  availableRangeItems: EntityRepresentative[];

  availableCardinalities: Cardinality[];

}

export function createCreateAssociationProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entity: SemanticModelRelationship,
): CreateAssociationProfileDialogState {
  const models = [...graphContext.models.values()];
  const availableModels = representModels(visualModel, models);
  const writableModels = representModels(visualModel, selectWritableModels(models));
  const representedModel = representModels(visualModel, [model])[0];

  const entities = graphContext.aggregatorView.getEntities();

  // Prepare list of associations and class profiles we can profile.
  const availableProfiles = sanitizeDuplicitiesInRepresentativeLabels(availableModels, [
    ...representRelationships(models,
      classesContext.relationships),
    ...representRelationshipProfiles(entities, models,
      classesContext.profiles.filter(item => isSemanticModelRelationshipUsage(item))),
  ]).filter(isRepresentingAttribute);
  sortRepresentatives(language, availableProfiles);

  // Prepare list of class and class profiles we can profile.
  const availableClassProfiles = sanitizeDuplicitiesInRepresentativeLabels(availableModels, [
    ...representClasses(models, classesContext.classes),
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
    // TODO: What should we do here?
    throw Error("Can not create dialog.");
  }

  const owlThing = representOwlThing();

  // Rest of this function depends of what we are profiling.
  const isProfilingProfile = profileOf.profileOfIdentifiers.length > 0;
  if (isProfilingProfile) {
    // We are profiling a profile, we need to get the effective values.
    const aggregated = entities[entity.id]?.aggregatedEntity;
    if (!isSemanticModelRelationshipUsage(aggregated)) {
      // TODO: What should we do here?
      throw Error("Can not create dialog.");
    }

    const { domain, range } = getDomainAndRange(aggregated);

    const domainRepresentation = availableClassProfiles
      .find(item => item.identifier === domain?.concept) ?? owlThing;

    const rangeRepresentation = availableClassProfiles
      .find(item => item.identifier === range?.concept) ?? owlThing;

    const availableCardinalities = [...representCardinalities()];

    // There may be no cardinality for inherited value.
    // We need a default, when user switch to inherit value.
    const domainCardinality = domain?.cardinality === null ?
      availableCardinalities[0] : representCardinality(domain?.cardinality);
    const rangeCardinality = range?.cardinality === null ?
      availableCardinalities[0] : representCardinality(range?.cardinality);

    return {
      language,
      availableModels,
      writableModels,
      model: representedModel,
      iri: entity.iri ?? "",
      iriPrefix: getModelIri(model),
      isIriAutogenerated: false,
      isIriRelative: isRelativeIri(entity.iri),
      name: entity.name ?? {},
      overrideName: false,
      description: entity.description ?? {},
      overrideDescription: false,
      availableProfiles,
      profileOf,
      usageNote: {},
      overrideUsageNote: true,
      disableOverrideUsageNote: true,
      domain: domainRepresentation,
      overrideDomain: false,
      domainCardinality,
      overrideDomainCardinality: false,
      availableDomainItems: [owlThing, ...availableClassProfiles],
      range: rangeRepresentation,
      overrideRange: false,
      rangeCardinality,
      overrideRangeCardinality: false,
      availableRangeItems: [owlThing, ...availableClassProfiles],
      availableCardinalities: [representUndefinedCardinality(), ...representCardinalities()],
    };
  } else {
    // We profile an association.
    const { domain, range } = getDomainAndRange(entity);

    const domainRepresentation = availableClassProfiles
      .find(item => item.identifier === domain?.concept) ?? owlThing;

    const rangeRepresentation = availableClassProfiles
      .find(item => item.identifier === range?.concept) ?? owlThing;

    return {
      language,
      availableModels,
      writableModels,
      model: representedModel,
      iri: entity.iri ?? "",
      iriPrefix: getModelIri(model),
      isIriAutogenerated: false,
      isIriRelative: isRelativeIri(entity.iri),
      name: entity.name ?? {},
      overrideName: false,
      description: entity.description ?? {},
      overrideDescription: false,
      availableProfiles,
      profileOf,
      usageNote: {},
      overrideUsageNote: true,
      disableOverrideUsageNote: true,
      domain: domainRepresentation,
      overrideDomain: false,
      domainCardinality: representCardinality(domain?.cardinality),
      overrideDomainCardinality: false,
      availableDomainItems: [owlThing, ...availableClassProfiles],
      range: rangeRepresentation,
      overrideRange: false,
      rangeCardinality: representCardinality(range?.cardinality),
      overrideRangeCardinality: false,
      availableRangeItems: [owlThing, ...availableClassProfiles],
      availableCardinalities: [representUndefinedCardinality(), ...representCardinalities()],
    };
  }
}

export interface CreateAssociationProfileDialogController extends EntityStateController, CreateEntityStateController, ProfileStateController {

  toggleNameOverride: () => void;

  toggleDescriptionOverride: () => void;

  setDomain: (value: EntityRepresentative) => void;

  toggleDomainOverride: () => void;

  setDomainCardinality: (value: Cardinality) => void;

  toggleDomainCardinalityOverride: () => void;

  setRange: (value: EntityRepresentative) => void;

  toggleRangeOverride: () => void;

  setRangeCardinality: (value: Cardinality) => void;

  toggleRangeCardinalityOverride: () => void;

}

export function useCreateAssociationProfileDialogController({ changeState }: DialogProps<CreateAssociationProfileDialogState>): CreateAssociationProfileDialogController {

  return useMemo(() => {

    const entityController = createEntityController(changeState);

    const newEntityController = createCreateEntityController(
      changeState, entityController, configuration().nameToClassIri);

    const profileController = createProfileController(changeState);

    const toggleNameOverride = () => {
      changeState((state) => ({ ...state, overrideName: !state.overrideName }));
    };

    const toggleDescriptionOverride = () => {
      changeState((state) => ({ ...state, overrideDescription: !state.overrideDescription }));
    };

    const setDomain = (value: EntityRepresentative) => {
      changeState((state) => ({ ...state, domain: value }));
    };

    const toggleDomainOverride = () => {
      changeState((state) => ({ ...state, overrideDomain: !state.overrideDomain }));
    };

    const setDomainCardinality = (value: Cardinality) => {
      changeState((state) => ({ ...state, domainCardinality: value }));
    };

    const toggleDomainCardinalityOverride = () => {
      changeState((state) => ({ ...state, overrideDomainCardinality: !state.overrideDomainCardinality }));
    };

    const setRange = (value: EntityRepresentative) => {
      changeState((state) => ({ ...state, range: value }));
    };

    const toggleRangeOverride = () => {
      changeState((state) => ({ ...state, overrideRange: !state.overrideRange }));
    };

    const setRangeCardinality = (value: Cardinality) => {
      changeState((state) => ({ ...state, rangeCardinality: value }));
    };

    const toggleRangeCardinalityOverride = () => {
      changeState((state) => ({ ...state, overrideRangeCardinality: !state.overrideRangeCardinality }));
    };

    return {
      ...entityController,
      ...profileController,
      ...newEntityController,
      toggleNameOverride,
      toggleDescriptionOverride,
      setDomain,
      toggleDomainOverride,
      setDomainCardinality,
      toggleDomainCardinalityOverride,
      setRange,
      toggleRangeOverride,
      setRangeCardinality,
      toggleRangeCardinalityOverride,
    };
  }, [changeState]);
}