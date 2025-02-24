import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { createLogger } from "../../application";
import { RuntimeError } from "../../application/error";
import { CmeModel } from "../../dataspecer/cme-model";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { Cardinality, EntityRepresentative, listCardinalities, representCardinality } from "./dialog-utilities";

const LOG = createLogger(import.meta.url);

export interface RelationshipState<RangeType> {

  /**
   * Domain.
   */
  domain: EntityRepresentative;

  /**
   * Domain cardinality.
   */
  domainCardinality: Cardinality;

  /**
   * Available domain items.
   */
  availableDomains: EntityRepresentative[];

  /**
   * Range.
   */
  range: RangeType;

  /**
   * Range cardinality.
   */
  rangeCardinality: Cardinality;

  /**
   * Available range items.
   */
  availableRanges: RangeType[];

  /**
   * Cardinalities that can be set.
   */
  availableCardinalities: Cardinality[];

}

export function createRelationshipStateForNew<RangeType extends {
  identifier: string,
  iri: string | null,
  label: LanguageString,
  vocabularyDsIdentifier: string,
}>(
  vocabularies: CmeModel[],
  domain: EntityRepresentative,
  availableDomains: EntityRepresentative[],
  range: RangeType,
  availableRanges: RangeType[],
): RelationshipState<RangeType> {

  return {
    domain,
    domainCardinality: representCardinality(null),
    availableDomains: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableDomains),
    range: range,
    rangeCardinality: representCardinality(null),
    availableRanges: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableRanges),
    availableCardinalities: listCardinalities(),
  };
}

export function createRelationshipStateForEdit<RangeType extends {
  identifier: string,
  iri: string | null,
  label: LanguageString,
  vocabularyDsIdentifier: string,
}>(
  vocabularies: CmeModel[],
  domain: string,
  domainCardinality: [number, number | null] | undefined | null,
  availableDomains: EntityRepresentative[],
  range: string,
  rangeCardinality: [number, number | null] | undefined | null,
  availableRanges: RangeType[],
): RelationshipState<RangeType> {

  const domainRepresentative = availableDomains.find(item => item.identifier === domain);
  if (domainRepresentative === undefined) {
    LOG.error("Missing domain representative.", {domain, availableDomains});
    throw new RuntimeError("Missing domain representative.");
  }

  const rangeRepresentative = availableRanges.find(item => item.identifier === range);
  if (rangeRepresentative === undefined) {
    LOG.error("Missing range representative.", {range, availableRanges});
    throw new RuntimeError("Missing range representative.");
  }

  return {
    domain: domainRepresentative,
    domainCardinality: representCardinality(domainCardinality),
    availableDomains: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableDomains),
    range: rangeRepresentative,
    rangeCardinality: representCardinality(rangeCardinality),
    availableRanges: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableRanges),
    availableCardinalities: listCardinalities(),
  };
}

export interface RelationshipController<RangeType> {

  setDomain: (value: EntityRepresentative) => void;

  setDomainCardinality: (value: Cardinality) => void;

  setRange: (value: RangeType) => void;

  setRangeCardinality: (value: Cardinality) => void;

}

export function createRelationshipController<RangeType, State extends RelationshipState<RangeType>>(
  changeState: (next: State | ((prevState: State) => State)) => void,
): RelationshipController<RangeType> {

  const setDomain = (value: EntityRepresentative) => {
    changeState((state) => ({ ...state, domain: value }));
  };

  const setDomainCardinality = (value: Cardinality) => {
    changeState((state) => ({ ...state, domainCardinality: value }));
  };

  const setRange = (value: RangeType) => {
    changeState((state) => ({ ...state, range: value }));
  };

  const setRangeCardinality = (value: Cardinality) => {
    changeState((state) => ({ ...state, rangeCardinality: value }));
  };

  return {
    setDomain,
    setDomainCardinality,
    setRange,
    setRangeCardinality,
  };
}
