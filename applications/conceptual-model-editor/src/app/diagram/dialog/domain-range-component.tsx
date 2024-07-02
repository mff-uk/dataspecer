import {
    isSemanticModelAttribute,
    type SemanticModelRelationship,
    type SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { CardinalityOptions } from "../components/cardinality-options";
import { isSemanticModelAttributeUsage, type SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import React, { type Dispatch, type SetStateAction } from "react";
import { DialogDetailRow } from "../components/dialog/dialog-detail-row";
import { SelectDomainOrRange } from "../components/input/select-domain-or-range";
import { isDataType } from "@dataspecer/core-v2/semantic-model/datatypes";
import { SelectAttributeRange } from "../components/input/select-attribute-range";
import type { OverriddenFieldsType } from "../util/profile-utils";
import {t} from "../application/";

/**
 * This component is used as part of:
 * - create association profile
 * - update association profile
 */
export const DomainRangeComponent = (props: {
    entity: SemanticModelRelationship | SemanticModelRelationshipUsage;
    range: SemanticModelRelationshipEnd;
    setRange: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
    domain: SemanticModelRelationshipEnd;
    setDomain: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
    onDomainChange?: () => void;
    onRangeChange?: () => void;
    onDomainCardinalityChange?: () => void;
    onRangeCardinalityChange?: () => void;
    withOverride?: {
        overriddenFields: OverriddenFieldsType;
        setOverriddenFields: Dispatch<SetStateAction<OverriddenFieldsType>>;
    };
    hideCardinality: boolean,
}) => {
    const { entity, range, setRange, domain, setDomain, withOverride, hideCardinality } = props;
    const isAttribute = isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity);
    return (
        <>
            <DialogDetailRow detailKey={t("domain")}>
                <SelectDomainOrRange
                    forElement="domain"
                    concept={domain.concept}
                    setConcept={(resourceId) => setDomain((prev) => ({ ...prev, concept: resourceId }))}
                    onChange={props.onDomainChange}
                    disabled={withOverride && !withOverride.overriddenFields?.domain}
                    withOverride={
                        withOverride
                            ? {
                                  callback: () =>
                                      withOverride.setOverriddenFields((prev) => ({ ...prev, domain: !prev.domain })),
                                  defaultValue: withOverride.overriddenFields.domain,
                              }
                            : undefined
                    }
                />
            </DialogDetailRow>

            {hideCardinality ? null :
                <DialogDetailRow detailKey={t("domain-cardinality")}>
                    <CardinalityOptions
                        disabled={(withOverride && !withOverride.overriddenFields?.domainCardinality) ?? false}
                        group="source"
                        defaultCard={domain.cardinality}
                        setCardinality={setDomain}
                        onChange={props.onDomainCardinalityChange}
                        withOverride={
                            withOverride
                                ? {
                                    callback: () =>
                                        withOverride.setOverriddenFields((prev) => ({
                                            ...prev,
                                            domainCardinality: !prev.domainCardinality,
                                        })),
                                    defaultValue: withOverride.overriddenFields.domainCardinality,
                                }
                                : undefined
                        }
                    />
                </DialogDetailRow>
            }

            {!(isAttribute && !hideCardinality) ? null : (
                <>
                    <DialogDetailRow detailKey={t("range")}>
                        <SelectAttributeRange
                            concept={range.concept}
                            isEnabled={withOverride?.overriddenFields?.range}
                            setRange={setRange}
                            onChange={props.onRangeChange}
                            withOverride={
                                withOverride
                                    ? {
                                          callback: () =>
                                              withOverride.setOverriddenFields((prev) => ({
                                                  ...prev,
                                                  range: !prev.range,
                                                  rangeCardinality: prev.range ? !prev.range : prev.rangeCardinality,
                                              })),
                                          defaultValue: withOverride.overriddenFields.range,
                                      }
                                    : undefined
                            }
                        />
                    </DialogDetailRow>
                    {/* show range cardinality only when range is selected*/}
                    {range.concept && !isDataType(range.concept) && (
                        <DialogDetailRow detailKey={t("range-cardinality")}>
                            <CardinalityOptions
                                disabled={(withOverride && !withOverride.overriddenFields?.rangeCardinality) ?? false}
                                group="target"
                                defaultCard={range.cardinality}
                                setCardinality={setRange}
                                onChange={props.onRangeCardinalityChange}
                                withOverride={
                                    withOverride && withOverride.overriddenFields.range
                                        ? {
                                              callback: () =>
                                                  withOverride.setOverriddenFields((prev) => ({
                                                      ...prev,
                                                      rangeCardinality: !prev.rangeCardinality,
                                                  })),
                                              defaultValue: withOverride.overriddenFields.rangeCardinality,
                                          }
                                        : undefined
                                }
                            />
                        </DialogDetailRow>
                    )}
                </>
            )}

            {!(!isAttribute && !hideCardinality) ? null : (
                <>
                    <DialogDetailRow
                        detailKey={t("range")}
                        style={isDataType(range.concept) ? "opacity-70" : ""}
                    >
                        <SelectDomainOrRange
                            forElement="range"
                            concept={range.concept}
                            setConcept={(resourceId) => setRange((prev) => ({ ...prev, concept: resourceId }))}
                            onChange={props.onRangeChange}
                            disabled={withOverride && !withOverride.overriddenFields?.range}
                            withOverride={
                                withOverride
                                    ? {
                                          callback: () =>
                                              withOverride.setOverriddenFields((prev) => ({
                                                  ...prev,
                                                  range: !prev.range,
                                              })),
                                          defaultValue: withOverride.overriddenFields.range,
                                      }
                                    : undefined
                            }
                        />
                    </DialogDetailRow>

                    {/* Show range cardinality only when range (concept) is selected. */}
                    {range.concept && !isDataType(range.concept) && (
                        <DialogDetailRow detailKey={t("range-cardinality")}>
                            <CardinalityOptions
                                disabled={(withOverride && !withOverride.overriddenFields?.rangeCardinality) ?? false}
                                group="target"
                                defaultCard={range.cardinality}
                                setCardinality={setRange}
                                onChange={props.onRangeCardinalityChange}
                                withOverride={
                                    withOverride
                                        ? {
                                              callback: () =>
                                                  withOverride.setOverriddenFields((prev) => ({
                                                      ...prev,
                                                      rangeCardinality: !prev.rangeCardinality,
                                                  })),
                                              defaultValue: withOverride.overriddenFields.rangeCardinality,
                                          }
                                        : undefined
                                }
                            />
                        </DialogDetailRow>
                    )}
                </>
            )}
        </>
    );
};
