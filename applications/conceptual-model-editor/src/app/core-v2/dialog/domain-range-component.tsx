import {
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { CardinalityOptions } from "../components/cardinality-options";
import {
    SemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { Dispatch, SetStateAction } from "react";
import { DialogDetailRow2 } from "../components/dialog/dialog-detail-row";
import { SelectDomainOrRange } from "../components/input/select-domain-or-range";

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
            <DialogDetailRow2 detailKey="range">
                <SelectDomainOrRange
                    concept={range.concept}
                    setConcept={(resourceId) => setRange((prev) => ({ ...prev, concept: resourceId }))}
                    onChange={props.onRangeChange}
                    disabled={withOverride && !enabledFields?.range}
                    withOverride={withOverride}
                    withNullValueEnabled={isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity)}
                    withAttributeInfo={isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity)}
                />
            </DialogDetailRow2>
            {/* show range cardinality only when range is selected */}
            {range.concept && (
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
    );
};
