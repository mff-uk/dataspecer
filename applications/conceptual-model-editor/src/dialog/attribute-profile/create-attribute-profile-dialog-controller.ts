import { useMemo } from "react";

import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualModel } from "@dataspecer/core-v2/visual-model";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { configuration } from "../../application";
import { getModelIri } from "../../util/iri-utils";
import { DialogProps } from "../dialog-api";
import { createCreateEntityController, createEntityController, CreateEntityState, CreateEntityStateController, EntityState, EntityStateController, isRelativeIri } from "../utilities/entity-utilities";
import { createProfileController, ProfileState, ProfileStateController } from "../utilities/profile-utilities";
import { Cardinality, DataTypeRepresentative, EntityRepresentative, isRepresentingAttribute, representCardinalities, representCardinality, representClasses, representClassProfiles, representDataTypes, representModels, representOwlThing, representRelationshipProfiles, representRelationships, representUndefinedCardinality, representUndefinedDataType, selectWritableModels, sortRepresentatives } from "../utilities/dialog-utilities";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { getDomainAndRange } from "../../util/relationship-utils";
import { validationNoProblem, ValidationState, validationWarning } from "../utilities/validation-utilities";

export interface CreateAttributeProfileDialogState extends EntityState, CreateEntityState, ProfileState {

  language: string;

  overrideName: boolean;

  overrideDescription: boolean;

  /**
   * Domain.
   */
  domain: EntityRepresentative;

  initialDomain: EntityRepresentative;

  overrideDomain: boolean;

  domainValidation: ValidationState;

  /**
   * Domain cardinality.
   */
  domainCardinality: Cardinality;

  initialDomainCardinality: Cardinality;

  overrideDomainCardinality: boolean;

  domainCardinalityValidation: ValidationState;

  /**
   * Available domain items.
   */
  availableDomainItems: EntityRepresentative[];

  /**
   * Range.
   */
  range: DataTypeRepresentative;

  initialRange: DataTypeRepresentative;

  overrideRange: boolean;

  rangeValidation: ValidationState;

  /**
   * Range cardinality.
   */
  rangeCardinality: Cardinality;

  initialRangeCardinality: Cardinality;

  overrideRangeCardinality: boolean;

  rangeCardinalityValidation: ValidationState;

  /**
   * Available range items.
   */
  availableRangeItems: DataTypeRepresentative[];

  availableCardinalities: Cardinality[];

}

export function createCreateAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  entity: SemanticModelRelationship | SemanticModelRelationshipUsage,
): CreateAttributeProfileDialogState {
  const models = [...graphContext.models.values()];
  const availableModels = representModels(visualModel, models);
  const writableModels = representModels(visualModel, selectWritableModels(models));
  const targetModel = writableModels[0];

  const entities = graphContext.aggregatorView.getEntities();

  // Prepare list of Attributes and class profiles we can profile.
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

  const availableDataTypes = representDataTypes();
  sortRepresentatives(language, availableDataTypes);

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

  const undefinedDataTyp = representUndefinedDataType();

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

    const rangeRepresentation = availableDataTypes
      .find(item => item.identifier === range?.concept) ?? undefinedDataTyp;

    const availableCardinalities = [...representCardinalities()];

    // There may be no cardinality for inherited value.
    // We need a default, when user switch to inherit value.
    const domainCardinality = domain?.cardinality === null ?
      availableCardinalities[0] : representCardinality(domain?.cardinality);
    const rangeCardinality = range?.cardinality === null ?
      availableCardinalities[0] : representCardinality(range?.cardinality);

    return validate({
      language,
      availableModels,
      writableModels,
      model: targetModel,
      iri: range?.iri ?? "",
      iriPrefix: getModelIri(targetModel.model),
      isIriAutogenerated: false,
      isIriRelative: isRelativeIri(range?.iri),
      name: range?.name ?? {},
      overrideName: false,
      description: range?.description ?? {},
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
      overrideDomainCardinality: false,
      domainCardinalityValidation: validationNoProblem(),
      availableDomainItems: [owlThing, ...availableClassProfiles],
      range: rangeRepresentation,
      initialRange: rangeRepresentation,
      overrideRange: false,
      rangeValidation: validationNoProblem(),
      rangeCardinality,
      overrideRangeCardinality: false,
      initialRangeCardinality: rangeCardinality,
      rangeCardinalityValidation: validationNoProblem(),
      availableRangeItems: [undefinedDataTyp, ...availableDataTypes],
      availableCardinalities: [representUndefinedCardinality(), ...representCardinalities()],
    });
  } else {
    // We profile an Attribute, little help for TypeScript as well.
    const { domain, range } = getDomainAndRange(entity as SemanticModelRelationship);

    const domainRepresentation = availableClassProfiles
      .find(item => item.identifier === domain?.concept) ?? owlThing;

    const rangeRepresentation = availableDataTypes
      .find(item => item.identifier === range?.concept) ?? undefinedDataTyp;

    const domainCardinality = representCardinality(domain?.cardinality);

    const rangeCardinality = representCardinality(range?.cardinality);

    return validate({
      language,
      availableModels,
      writableModels,
      model: targetModel,
      iri: range?.iri ?? "",
      iriPrefix: getModelIri(targetModel.model),
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
      overrideRangeCardinality: false,
      initialRangeCardinality: rangeCardinality,
      rangeCardinalityValidation: validationNoProblem(),
      availableRangeItems: [undefinedDataTyp, ...availableDataTypes],
      availableCardinalities: [representUndefinedCardinality(), ...representCardinalities()],
    });
  }
}

export interface CreateAttributeProfileDialogController extends EntityStateController, CreateEntityStateController, ProfileStateController {

  toggleNameOverride: () => void;

  toggleDescriptionOverride: () => void;

  setDomain: (value: EntityRepresentative) => void;

  toggleDomainOverride: () => void;

  setDomainCardinality: (value: Cardinality) => void;

  toggleDomainCardinalityOverride: () => void;

  setRange: (value: DataTypeRepresentative) => void;

  toggleRangeOverride: () => void;

  setRangeCardinality: (value: Cardinality) => void;

  toggleRangeCardinalityOverride: () => void;

}

export function useCreateAttributeProfileDialogController({ changeState }: DialogProps<CreateAttributeProfileDialogState>): CreateAttributeProfileDialogController {

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
      changeState((state) => validate({ ...state, domain: value }));
    };

    const toggleDomainOverride = () => {
      changeState((state) => validate({ ...state, overrideDomain: !state.overrideDomain }));
    };

    const setDomainCardinality = (value: Cardinality) => {
      changeState((state) => validate({ ...state, domainCardinality: value }));
    };

    const toggleDomainCardinalityOverride = () => {
      changeState((state) => validate({ ...state, overrideDomainCardinality: !state.overrideDomainCardinality }));
    };

    const setRange = (value: DataTypeRepresentative) => {
      changeState((state) => validate({ ...state, range: value }));
    };

    const toggleRangeOverride = () => {
      changeState((state) => validate({ ...state, overrideRange: !state.overrideRange }));
    };

    const setRangeCardinality = (value: Cardinality) => {
      changeState((state) => validate({ ...state, rangeCardinality: value }));
    };

    const toggleRangeCardinalityOverride = () => {
      changeState((state) => validate({ ...state, overrideRangeCardinality: !state.overrideRangeCardinality }));
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

function validate(state: CreateAttributeProfileDialogState): CreateAttributeProfileDialogState {

  const domainValidation = state.initialDomain.identifier === state.domain.identifier || !state.overrideDomain ?
    validationNoProblem() : validationWarning("warning-change-domain");

  const domainCardinalityValidation = state.initialDomainCardinality.identifier === state.domainCardinality.identifier || !state.overrideDomainCardinality ?
    validationNoProblem() : validationWarning("warning-change-domain-cardinality");

  const rangeValidation = state.initialRange.identifier === state.range.identifier || !state.overrideRange ?
    validationNoProblem() : validationWarning("warning-change-range");

  const rangeCardinalityValidation = state.initialRangeCardinality.identifier === state.rangeCardinality.identifier || !state.overrideRangeCardinality ?
    validationNoProblem() : validationWarning("warning-change-range-cardinality");

  return {
    ...state,
    domainValidation,
    domainCardinalityValidation,
    rangeValidation,
    rangeCardinalityValidation,
  };
}
