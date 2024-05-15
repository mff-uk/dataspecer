import { SemanticModelRelationship, SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { CardinalityOptions } from "../components/cardinality-options";
import { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import React, { Dispatch, SetStateAction } from "react";
import { DialogDetailRow2 } from "../components/dialog/dialog-detail-row";
import { SelectDomainOrRange } from "../components/input/select-domain-or-range";
import { isDataType } from "@dataspecer/core-v2/semantic-model/datatypes";
import { SelectAttributeRange } from "../components/input/select-attribute-range";
import { isAnAttribute, isAnEdge } from "../util/relationship-utils";
import { OverriddenFieldsType } from "../util/profile-utils";

export const DomainRangeComponent = (props: {
    entity: SemanticModelRelationship | SemanticModelRelationshipUsage;
    range: SemanticModelRelationshipEnd;
    setRange: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
    domain: SemanticModelRelationshipEnd;
    setDomain: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
    enabledFields?: {
        name: boolean;
        description: boolean;
        domain: boolean;
        domainCardinality: boolean;
        range: boolean;
        rangeCardinality: boolean;
    };
    onDomainChange?: () => void;
    onRangeChange?: () => void;
    onDomainCardinalityChange?: () => void;
    onRangeCardinalityChange?: () => void;
    withOverride?: {
        overriddenFields: OverriddenFieldsType;
        setOverriddenFields: Dispatch<SetStateAction<OverriddenFieldsType>>;
    };
}) => {
    const { entity, range, setRange, domain, setDomain, enabledFields, withOverride } = props;
    const isAttribute = isAnAttribute(entity);
    const isEdge = isAnEdge(entity);

    console.log(entity, range, domain);

    return (
        <>
            <DialogDetailRow2 detailKey="domain">
                <SelectDomainOrRange
                    forElement="domain"
                    concept={domain.concept}
                    setConcept={(resourceId) => setDomain((prev) => ({ ...prev, concept: resourceId }))}
                    onChange={props.onDomainChange}
                    disabled={withOverride && !withOverride.overriddenFields?.domain}
                    withOverride={
                        withOverride
                            ? () => withOverride.setOverriddenFields((prev) => ({ ...prev, domain: !prev.domain }))
                            : undefined
                    }
                />
            </DialogDetailRow2>
            <DialogDetailRow2 detailKey="domain cardinality">
                <CardinalityOptions
                    disabled={(withOverride && !withOverride.overriddenFields?.domainCardinality) ?? false}
                    group="source"
                    defaultCard={domain.cardinality}
                    setCardinality={setDomain}
                    onChange={props.onDomainCardinalityChange}
                    withOverride={
                        withOverride
                            ? () =>
                                  withOverride.setOverriddenFields((prev) => ({
                                      ...prev,
                                      domainCardinality: !prev.domainCardinality,
                                  }))
                            : undefined
                    }
                />
            </DialogDetailRow2>

            {isAttribute && (
                <>
                    <DialogDetailRow2 detailKey="range">
                        <SelectAttributeRange
                            concept={range.concept}
                            isEnabled={withOverride?.overriddenFields?.range}
                            setRange={setRange}
                            onChange={props.onRangeChange}
                            withOverride={
                                withOverride
                                    ? () =>
                                          withOverride.setOverriddenFields((prev) => ({
                                              ...prev,
                                              range: !prev.range,
                                              rangeCardinality: prev.range ? !prev.range : prev.rangeCardinality,
                                          }))
                                    : undefined
                            }
                        />
                    </DialogDetailRow2>
                    {/* show range cardinality only when range is selected*/}
                    {range.concept && !isDataType(range.concept) && (
                        <DialogDetailRow2 detailKey="range cardinality">
                            <CardinalityOptions
                                disabled={(withOverride && !withOverride.overriddenFields?.rangeCardinality) ?? false}
                                group="target"
                                defaultCard={range.cardinality}
                                setCardinality={setRange}
                                onChange={props.onRangeCardinalityChange}
                                withOverride={
                                    withOverride && withOverride.overriddenFields.range
                                        ? () =>
                                              withOverride.setOverriddenFields((prev) => ({
                                                  ...prev,
                                                  rangeCardinality: !prev.rangeCardinality,
                                              }))
                                        : undefined
                                }
                            />
                        </DialogDetailRow2>
                    )}
                </>
            )}

            {!isAttribute && (
                <>
                    <DialogDetailRow2
                        detailKey="range"
                        style={isAttribute && isDataType(range.concept) ? "opacity-70" : ""}
                    >
                        <SelectDomainOrRange
                            forElement="range"
                            concept={range.concept}
                            setConcept={(resourceId) => setRange((prev) => ({ ...prev, concept: resourceId }))}
                            onChange={props.onRangeChange}
                            disabled={withOverride && !withOverride.overriddenFields?.range}
                            withOverride={
                                withOverride
                                    ? () =>
                                          withOverride.setOverriddenFields((prev) => ({
                                              ...prev,
                                              range: !prev.range,
                                          }))
                                    : undefined
                            }
                        />
                    </DialogDetailRow2>
                    {/* show range cardinality only when range is selected */}
                    {range.concept && !isDataType(range.concept) && (
                        <DialogDetailRow2 detailKey="range cardinality">
                            <CardinalityOptions
                                disabled={(withOverride && !withOverride.overriddenFields?.rangeCardinality) ?? false}
                                group="target"
                                defaultCard={range.cardinality}
                                setCardinality={setRange}
                                onChange={props.onRangeCardinalityChange}
                                withOverride={
                                    withOverride
                                        ? () =>
                                              withOverride.setOverriddenFields((prev) => ({
                                                  ...prev,
                                                  rangeCardinality: !prev.rangeCardinality,
                                              }))
                                        : undefined
                                }
                            />
                        </DialogDetailRow2>
                    )}
                </>
            )}
        </>
    );
};
