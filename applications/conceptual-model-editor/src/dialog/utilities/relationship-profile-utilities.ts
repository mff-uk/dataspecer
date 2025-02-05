import { createLogger } from "../../application";
import { RuntimeError } from "../../application/error";
import { Cardinality, EntityRepresentative, RelationshipRepresentative, representCardinalities, representCardinality, representOwlThing, representUndefinedClass, UNDEFINED_IDENTIFIER } from "./dialog-utilities";
import { RelationshipController, RelationshipState, createRelationshipController } from "./relationship-utilities";
import { ValidationState, validationNoProblem } from "./validation-utilities";

const LOG = createLogger(import.meta.url);

export interface RelationshipProfileState<RangeType> extends RelationshipState<RangeType> {

  /**
   * We need this to select default profile after a profile is removed.
   * We keep this empty and let the {@link EntityProfileState} manage it.
   */
  profileOf: RelationshipRepresentative[];

  // Domain

  domainSource: RelationshipRepresentative;

  domainSourceValue: EntityRepresentative;

  overrideDomain: boolean;

  domainValidation: ValidationState;

  // Domain cardinality

  domainCardinalitySource: RelationshipRepresentative;

  domainCardinalitySourceValue: Cardinality;

  overrideDomainCardinality: boolean;

  domainCardinalityValidation: ValidationState;

  // Range

  rangeSource: RelationshipRepresentative;

  rangeSourceValue: RangeType;

  overrideRange: boolean;

  rangeValidation: ValidationState;

  defaultRange: RangeType;

  // Range cardinality

  rangeCardinalitySource: RelationshipRepresentative;

  rangeCardinalitySourceValue: Cardinality;

  overrideRangeCardinality: boolean;

  rangeCardinalityValidation: ValidationState;

}

export function createRelationshipProfileStateForNew<RangeType extends { identifier: string }>(
  profileOf: RelationshipRepresentative,
  domain: string | null,
  domainCardinality: [number, number | null] | undefined | null,
  availableDomains: EntityRepresentative[],
  range: string | null,
  defaultRange: RangeType,
  rangeCardinality: [number, number | null] | undefined | null,
  availableRanges: RangeType[],
): RelationshipProfileState<RangeType> {

  // Domain
  const effectiveDomain = domain ?? UNDEFINED_IDENTIFIER;
  let initialDomain = availableDomains.find(item => item.identifier === effectiveDomain);
  if (initialDomain === undefined) {
    LOG.warn("Can not find domain representative.", {domain: effectiveDomain, availableDomains})
    initialDomain = representUndefinedClass();
  }
  let domainSourceValue = availableDomains.find(item => item.identifier === profileOf.domain);
  if (domainSourceValue === undefined) {
    LOG.warn("Can not find domain source value representative.", {domain: profileOf.domain, availableDomains})
    domainSourceValue = representUndefinedClass();
  }

  // Range
  const effectiveRange = range ?? UNDEFINED_IDENTIFIER;
  let initialRange = availableRanges.find(item => item.identifier === effectiveRange);
  if (initialRange === undefined) {
    LOG.warn("Can not find range representative.", {range: effectiveRange, availableRanges})
    initialRange = defaultRange;
  }
  let rangeSourceValue = availableRanges.find(item => item.identifier === profileOf.range);
  if (rangeSourceValue === undefined) {
    LOG.warn("Can not find range source value representative.", {range: profileOf.range, availableRanges})
    rangeSourceValue = defaultRange;
  }

  return {
    profileOf: [profileOf],
    // Domain
    domain: initialDomain,
    overrideDomain: false,
    domainSource: profileOf,
    domainSourceValue,
    domainValidation: validationNoProblem(),
    // Domain cardinality
    domainCardinality: representCardinality(domainCardinality),
    overrideDomainCardinality: false,
    domainCardinalitySource: profileOf,
    domainCardinalitySourceValue: profileOf.domainCardinality,
    domainCardinalityValidation: validationNoProblem(),
    availableDomains: availableDomains,
    // Range
    range: initialRange,
    overrideRange: false,
    rangeSource: profileOf,
    rangeSourceValue,
    rangeValidation: validationNoProblem(),
    defaultRange,
    // Range cardinality
    rangeCardinality: representCardinality(rangeCardinality),
    overrideRangeCardinality: false,
    rangeCardinalitySource: profileOf,
    rangeCardinalitySourceValue: profileOf.rangeCardinality,
    rangeCardinalityValidation: validationNoProblem(),
    availableRanges: availableRanges,
    availableCardinalities: representCardinalities(),
  };
}

export function createRelationshipProfileStateForEdit<RangeType extends { identifier: string }>(
  availableProfiles: RelationshipRepresentative[],
  profiles: string[],
  domain: string | null,
  domainSource: string | null,
  domainCardinality: [number, number | null] | undefined | null,
  domainCardinalitySource: string | null,
  availableDomains: EntityRepresentative[],
  range: string | null,
  rangeSource: string | null,
  defaultRange: RangeType,
  rangeCardinality: [number, number | null] | undefined | null,
  rangeCardinalitySource: string | null,
  availableRanges: RangeType[],
): RelationshipProfileState<RangeType> {

  const profileOf = availableProfiles.filter(item => profiles.includes(item.identifier));
  if (profileOf.length === 0) {
    throw new RuntimeError("Missing all profiled entities.");
  }

  // Since we need to have profile value for sources,
  // we use this ona as a default.
  const fallbackProfile = profileOf[0];

  // Domain
  const effectiveDomain = domain ?? UNDEFINED_IDENTIFIER;
  const initialDomain = availableDomains.find(item => item.identifier === effectiveDomain);
  if (initialDomain === undefined) {
    throw new RuntimeError("Can not find domain representative.")
  }
  const domainSourceProfile = availableProfiles.find(
    item => item.identifier == domainSource) ?? fallbackProfile;
  const domainSourceValue = availableDomains.find(item => item.identifier === domainSourceProfile.domain);
  if (domainSourceValue === undefined) {
    throw new RuntimeError("Can not find profiled domain representative.")
  }

  // Domain cardinality
  const initialDomainCardinality = representCardinality(domainCardinality);
  const domainCardinalitySourceProfile = availableProfiles.find(
    item => item.identifier == domainCardinalitySource) ?? fallbackProfile;
  const domainCardinalitySourceValue = domainCardinalitySourceProfile.domainCardinality;

  // Range
  const effectiveRange = domain ?? UNDEFINED_IDENTIFIER;
  const initialRange = availableRanges.find(item => item.identifier === effectiveRange);
  if (initialRange === undefined) {
    throw new RuntimeError("Can not find range representative.")
  }
  const rangeSourceProfile = availableProfiles.find(
    item => item.identifier == rangeSource) ?? fallbackProfile;
  const rangeSourceValue = availableRanges.find(item => item.identifier === rangeSourceProfile.domain);
  if (rangeSourceValue === undefined) {
    throw new RuntimeError("Can not find profiled range representative.")
  }

  // Range cardinality
  const initialRangeCardinality = representCardinality(rangeCardinality);
  const rangeCardinalitySourceProfile = availableProfiles.find(
    item => item.identifier == rangeCardinalitySource) ?? fallbackProfile;
  const rangeCardinalitySourceValue = rangeCardinalitySourceProfile.rangeCardinality;
  //

  return {
    profileOf,
    // Domain
    domain: initialDomain,
    overrideDomain: domain !== null,
    domainSource: domainSourceProfile,
    domainSourceValue,
    domainValidation: validationNoProblem(),
    // Domain cardinality
    domainCardinality: initialDomainCardinality,
    overrideDomainCardinality: domainCardinality !== null,
    domainCardinalitySource: domainCardinalitySourceProfile,
    domainCardinalitySourceValue,
    domainCardinalityValidation: validationNoProblem(),
    availableDomains: availableDomains,
    // Range
    range: initialRange,
    overrideRange: range !== null,
    rangeSource: rangeSourceProfile,
    rangeSourceValue,
    rangeValidation: validationNoProblem(),
    defaultRange,
    // Range cardinality
    rangeCardinality: initialRangeCardinality,
    overrideRangeCardinality: rangeCardinality !== null,
    rangeCardinalitySource: rangeCardinalitySourceProfile,
    rangeCardinalitySourceValue,
    rangeCardinalityValidation: validationNoProblem(),
    availableRanges: availableRanges,
    //
    availableCardinalities: representCardinalities(),
  };
}

export interface RelationshipProfileStateController<RangeType> extends RelationshipController<RangeType> {

  /**
   * Does not update profile list, only apply changes.
   * Must be called after the list of profiles is updated.
   */
  onRemoveProfileOf: (value: RelationshipRepresentative) => void;

  toggleDomainOverride: () => void;

  setDomainSource: (value: RelationshipRepresentative) => void;

  toggleDomainCardinalityOverride: () => void;

  setDomainCardinalitySource: (value: RelationshipRepresentative) => void;

  toggleRangeOverride: () => void;

  setRangeSource: (value: RelationshipRepresentative) => void;

  toggleRangeCardinalityOverride: () => void;

  setRangeCardinalitySource: (value: RelationshipRepresentative) => void;

}

export function createRelationshipProfileController<
  RangeType extends { identifier: string },
  State extends RelationshipProfileState<RangeType>
>(
  changeState: (next: State | ((prevState: State) => State)) => void,
): RelationshipProfileStateController<RangeType> {

  const relationshipController = createRelationshipController(changeState);

  const onRemoveProfileOf = (value: RelationshipRepresentative) => {
    changeState((state) => {
      // We know this should never be empty.
      const defaultProfileOf = state.profileOf[0];
      // We could remove profile used as a source for some entities.
      // We need to copy the values and set a new value.
      const result = { ...state };
      if (result.domainSource === value) {
        result.domain = result.domainSourceValue;
        result.domainSource = defaultProfileOf;
        const domainSourceValue = state.availableDomains.find(
          item => item.identifier === defaultProfileOf.domain);
        if (domainSourceValue === null) {
          LOG.error("Missing domain representant.")
          result.domainSourceValue = representOwlThing();
        }
        result.overrideDomain = true;
      }
      if (result.domainCardinalitySource === value) {
        result.domainCardinality = result.domainCardinalitySourceValue;
        result.domainCardinalitySource = defaultProfileOf;
        result.domainCardinalitySourceValue = defaultProfileOf.domainCardinality;
        result.overrideDomainCardinality = true;
      }
      if (result.rangeSource === value) {
        result.range = result.rangeSourceValue;
        result.rangeSource = defaultProfileOf;
        const rangeSourceValue = state.availableRanges.find(
          item => item.identifier === defaultProfileOf.range);
        if (rangeSourceValue === null) {
          LOG.error("Missing domain representant.")
          result.rangeSourceValue = result.defaultRange;
        }
        result.overrideRange = true;
      }
      if (result.rangeCardinalitySource === value) {
        result.rangeCardinality = result.rangeCardinalitySourceValue;
        result.rangeCardinalitySource = defaultProfileOf;
        result.rangeCardinalitySourceValue = defaultProfileOf.rangeCardinality;
        result.overrideDomainCardinality = true;
      }
      return result;
    });
  };

  const toggleDomainOverride = () => {
    changeState((state) => ({
      ...state,
      overrideDomain: !state.overrideDomain,
    }));
  };

  const setDomainSource = (value: RelationshipRepresentative) => {
    changeState((state) => ({
      ...state,
      domainSource: value,
      domainSourceValue: value.domain,
    }));
  };

  const toggleDomainCardinalityOverride = () => {
    changeState((state) => ({
      ...state,
      overrideDomainCardinality: !state.overrideDomainCardinality,
    }));
  };

  const setDomainCardinalitySource = (value: RelationshipRepresentative) => {
    changeState((state) => ({
      ...state,
      domainCardinalitySource: value,
      domainCardinalitySourceValue: value.domainCardinality,
    }));
  };

  const toggleRangeOverride = () => {
    changeState((state) => ({
      ...state,
      overrideRange: !state.overrideRange,
    }));
  };

  const setRangeSource = (value: RelationshipRepresentative) => {
    changeState((state) => ({
      ...state,
      rangeSource: value,
      rangeSourceValue: value.range,
    }));
  };

  const toggleRangeCardinalityOverride = () => {
    changeState((state) => ({
      ...state,
      overrideRangeCardinality: !state.overrideRangeCardinality,
    }));
  };

  const setRangeCardinalitySource = (value: RelationshipRepresentative) => {
    changeState((state) => ({
      ...state,
      rangeCardinalitySource: value,
      rangeCardinalitySourceValue: value.rangeCardinality,
    }));
  };

  return {
    ...relationshipController,
    onRemoveProfileOf,
    toggleDomainOverride,
    setDomainSource,
    toggleDomainCardinalityOverride,
    setDomainCardinalitySource,
    toggleRangeOverride,
    setRangeSource,
    toggleRangeCardinalityOverride,
    setRangeCardinalitySource,
  };

}
