import { SemanticModelRelationship, SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { CardinalityOptions } from "../components/cardinality-options";
import { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { Dispatch, SetStateAction } from "react";
import { DialogDetailRow2 } from "../components/dialog/dialog-detail-row";
import { SelectDomainOrRange } from "../components/input/select-domain-or-range";
import { isDataType } from "@dataspecer/core-v2/semantic-model/datatypes";
import { SelectAttributeRange } from "../components/input/select-attribute-range";
import { isAnAttribute, isAnEdge } from "../util/relationship-utils";

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
    withOverride?: boolean;
}) => {
    const { entity, range, setRange, domain, setDomain, enabledFields, withOverride } = props;
    const isAttribute = isAnAttribute(entity);
    const isEdge = isAnEdge(entity);

    console.log(entity, range, domain);

    return (
        <>
            <DialogDetailRow2 detailKey="domain">
                <SelectDomainOrRange
                    concept={domain.concept}
                    setConcept={(resourceId) => setDomain((prev) => ({ ...prev, concept: resourceId }))}
                    onChange={props.onDomainChange}
                    disabled={withOverride && !enabledFields?.domain}
                    withOverride={withOverride}
                />
            </DialogDetailRow2>
            <DialogDetailRow2 detailKey="domain cardinality">
                <CardinalityOptions
                    disabled={(withOverride && !props.enabledFields?.domainCardinality) ?? false}
                    group="source"
                    defaultCard={domain.cardinality}
                    setCardinality={setDomain}
                    onChange={props.onDomainCardinalityChange}
                    withOverride={withOverride}
                />
            </DialogDetailRow2>

            {isAttribute && (
                <>
                    <DialogDetailRow2 detailKey="range">
                        <SelectAttributeRange
                            concept={range.concept}
                            isEnabled={enabledFields?.range}
                            setRange={setRange}
                            onChange={props.onRangeChange}
                            withOverride={withOverride}
                        />
                    </DialogDetailRow2>
                    {/* show range cardinality only when range is selected*/}
                    {range.concept && !isDataType(range.concept) && (
                        <DialogDetailRow2 detailKey="range cardinality">
                            <CardinalityOptions
                                disabled={(withOverride && !props.enabledFields?.rangeCardinality) ?? false}
                                group="target"
                                defaultCard={range.cardinality}
                                setCardinality={setRange}
                                onChange={props.onRangeCardinalityChange}
                                withOverride={withOverride}
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
                            concept={range.concept}
                            setConcept={(resourceId) => setRange((prev) => ({ ...prev, concept: resourceId }))}
                            onChange={props.onRangeChange}
                            disabled={withOverride && !enabledFields?.range}
                            withOverride={withOverride}
                        />
                    </DialogDetailRow2>
                    {/* show range cardinality only when range is selected */}
                    {range.concept && !isDataType(range.concept) && (
                        <DialogDetailRow2 detailKey="range cardinality">
                            <CardinalityOptions
                                disabled={(withOverride && !props.enabledFields?.rangeCardinality) ?? false}
                                group="target"
                                defaultCard={range.cardinality}
                                setCardinality={setRange}
                                onChange={props.onRangeCardinalityChange}
                                withOverride={withOverride}
                            />
                        </DialogDetailRow2>
                    )}
                </>
            )}
        </>
    );
};
