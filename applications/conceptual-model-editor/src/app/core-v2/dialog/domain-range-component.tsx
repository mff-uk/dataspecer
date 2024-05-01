import {
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { getLocalizedString, getStringFromLanguageStringInLang } from "../util/language-utils";
import { CardinalityOptions } from "../components/cardinality-options";
import { semanticCardinalityToOption } from "../util/relationship-utils";
import {
    SemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { Dispatch, SetStateAction } from "react";
import { useConfigurationContext } from "../context/configuration-context";
import { useClassesContext } from "../context/classes-context";
import { OverrideFieldCheckbox } from "../components/input/override-field-checkbox";
import { getFallbackDisplayName } from "../util/name-utils";

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
    withCheckEnabling?: boolean;
}) => {
    const { language: preferredLanguage } = useConfigurationContext();
    const { classes2, profiles: p } = useClassesContext();
    const { entity, range, setRange, domain, setDomain } = props;

    const classesOrProfiles = [...classes2, ...p.filter(isSemanticModelClassUsage)];

    console.log(entity, range, domain);

    return (
        <>
            <div className="font-semibold">domain:</div>
            <div className="flex flex-row">
                <select
                    className="flex-grow"
                    disabled={props.withCheckEnabling && !props.enabledFields?.domain}
                    onChange={(e) => {
                        setDomain((prev) => ({ ...prev, concept: e.target.value }));
                        props.onDomainChange?.();
                    }}
                >
                    <option disabled={true} selected={domain.concept == "" || domain.concept == null}>
                        ---
                    </option>
                    {classesOrProfiles.map((v) => {
                        const displayName =
                            getLocalizedString(getStringFromLanguageStringInLang(v.name || {}, preferredLanguage)) ??
                            getFallbackDisplayName(v);

                        return (
                            <option value={v.id} selected={domain.concept == v.id}>
                                {displayName}
                            </option>
                        );
                    })}
                </select>
                {props.withCheckEnabling && (
                    <div className="ml-2">
                        <OverrideFieldCheckbox
                            forElement="domain-range-component-domain"
                            disabled={props.enabledFields?.domain}
                            onChecked={props.onDomainChange}
                        />
                    </div>
                )}
            </div>
            <div className="font-semibold">domain cardinality:</div>
            <div className="flex flex-row">
                <div className="flex-grow">
                    <CardinalityOptions
                        disabled={(props.withCheckEnabling && !props.enabledFields?.domainCardinality) ?? false}
                        group="source"
                        defaultCard={domain.cardinality}
                        setCardinality={setDomain}
                        onChange={props.onDomainCardinalityChange}
                    />
                </div>
                {props.withCheckEnabling && (
                    <div className="ml-2">
                        <OverrideFieldCheckbox
                            forElement="domain-range-component-domain-cardinality"
                            disabled={props.enabledFields?.domainCardinality}
                            onChecked={props.onDomainCardinalityChange}
                        />
                    </div>
                )}
            </div>
            <div className="font-semibold">range:</div>
            <div className="flex w-full flex-row">
                {(isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity)) && (
                    <div className="mr-4">
                        attribute
                        <span className="ml-1" title="setting a range makes this attribute more of a relationship">
                            ❓
                        </span>
                    </div>
                )}
                <select
                    disabled={props.withCheckEnabling && !props.enabledFields?.range}
                    className="flex-grow"
                    onChange={(e) => {
                        if (e.target.value == "null") {
                            // @ts-ignore
                            setRange((prev) => ({ ...prev, concept: undefined }));
                        } else {
                            setRange((prev) => ({ ...prev, concept: e.target.value }));
                        }
                        props.onRangeChange?.();
                    }}
                >
                    <option
                        defaultChecked={isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity)}
                        value={"null"}
                    >
                        ---
                    </option>
                    {classesOrProfiles.map((v) => {
                        const displayName =
                            getLocalizedString(getStringFromLanguageStringInLang(v.name || {}, preferredLanguage)) ??
                            getFallbackDisplayName(v);

                        return (
                            <option value={v.id} selected={range.concept == v.id}>
                                {displayName}
                            </option>
                        );
                    })}
                </select>
                {props.withCheckEnabling && (
                    <div className="ml-2">
                        <OverrideFieldCheckbox
                            forElement="domain-range-component-range"
                            disabled={props.enabledFields?.range}
                            onChecked={props.onRangeChange}
                        />
                    </div>
                )}
            </div>
            {/* show range cardinality only when range is selected */}
            {range.concept && (
                <>
                    <div className="font-semibold">range cardinality:</div>
                    <div className="flex flex-row">
                        <div className="flex-grow">
                            <CardinalityOptions
                                disabled={(props.withCheckEnabling && !props.enabledFields?.rangeCardinality) ?? false}
                                group="target"
                                defaultCard={range.cardinality}
                                setCardinality={setRange}
                                onChange={props.onRangeCardinalityChange}
                            />
                        </div>
                        {props.withCheckEnabling && (
                            <div className="ml-2">
                                <OverrideFieldCheckbox
                                    forElement="domain-range-component-range-cardinality"
                                    disabled={props.enabledFields?.rangeCardinality}
                                    onChecked={props.onRangeCardinalityChange}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
};
