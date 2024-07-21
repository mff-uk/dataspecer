import { type Dispatch, type SetStateAction, type ChangeEvent } from "react";

import {
    SemanticModelClass,
    isSemanticModelAttribute,
    type SemanticModelRelationship,
    type SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    SemanticModelClassUsage,
    isSemanticModelAttributeUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
    type SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { CardinalityOptions } from "../components/cardinality-options";
import { DialogDetailRow } from "../components/dialog/dialog-detail-row";
import type { OverriddenFieldsType } from "../util/profile-utils";
import { useClassesContext } from "../context/classes-context";
import { OverrideFieldCheckbox } from "../components/input/override-field-checkbox";
import type { WithOverrideHandlerType } from "../util/profile-utils";
import { prepareSemanticModelEntitiesForSelect, SelectItem } from "../service/entity-service";

import { t } from "../application/";
import { DataTypeURIs, dataTypeUriToName } from "@dataspecer/core-v2/semantic-model/datatypes";

interface DomainRangeComponentType {
    entity: SemanticModelRelationship | SemanticModelRelationshipUsage;

    domain: SemanticModelRelationshipEnd;
    setDomain: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
    onDomainChange?: () => void;
    onDomainCardinalityChange?: () => void;

    range: SemanticModelRelationshipEnd;
    setRange: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
    onRangeChange?: () => void;
    onRangeCardinalityChange?: () => void;

    withOverride?: {
        overriddenFields: OverriddenFieldsType;
        setOverriddenFields: Dispatch<SetStateAction<OverriddenFieldsType>>;
    };
    hideCardinality: boolean,
}

/**
 * This component render domain and optionally range for attributes, associations, and their profiles.
 */
export const DomainRangeComponent = (props: DomainRangeComponentType) => {
    const { entity } = props;
    const isAttribute = isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity);
    const isProfile = isSemanticModelClassUsage(entity) || isSemanticModelRelationshipUsage(entity);
    if (isProfile) {
        if (isAttribute) {
            // Attribute profile
            return (
                <>
                    {renderDomain(props, SelectDomainForProfile)}
                    {renderAttributeRange(props, SelectRangeForAttribute)}
                </>
            );
        } else {
            // Association profile
            return (
                <>
                    {renderDomain(props, SelectDomainForProfile)}
                    {renderAssociationRange(props, SelectRangeForAssociationProfile)}
                </>
            );
        }
    } else {
        if (isAttribute) {
            // Attribute
            return (
                <>
                    {renderDomain(props, SelectDomain)}
                    {renderAttributeRange(props, SelectRangeForAttribute)}
                </>
            );
        } else {
            // Association
            return (
                <>
                    {renderDomain(props, SelectDomain)}
                    {renderAssociationRange(props, SelectRangeForAssociation)}
                </>
            );
        }
    }
};

const renderDomain = (props: DomainRangeComponentType, Component: (props: SelectType) => JSX.Element) => {

    const domainOverride = props.withOverride === undefined ? undefined : {
        callback: () => props.withOverride?.setOverriddenFields((prev) => ({ ...prev, domain: !prev.domain })),
        defaultValue: props.withOverride.overriddenFields.domain,
    };

    const domainCardinalityOverride = props.withOverride === undefined ? undefined : {
        callback: () => props.withOverride?.setOverriddenFields((prev) => ({ ...prev, domainCardinality: !prev.domainCardinality })),
        defaultValue: props.withOverride.overriddenFields.domainCardinality,
    };

    return (
        <>
            <DialogDetailRow detailKey={t("domain")}>
                <Component
                    value={props.domain.concept}
                    setValue={(identifier) => props.setDomain({ ...props.domain, concept: identifier })}
                    onChange={props.onDomainChange}
                    disabled={props.withOverride && !props.withOverride.overriddenFields?.domain}
                    withOverride={domainOverride}

                />
            </DialogDetailRow>
            {props.hideCardinality ? null :
                <DialogDetailRow detailKey={t("domain-cardinality")}>
                    <CardinalityOptions
                        disabled={(props.withOverride && !props.withOverride.overriddenFields?.domainCardinality) ?? false}
                        group="source"
                        defaultCard={props.domain.cardinality}
                        setCardinality={props.setDomain}
                        onChange={props.onDomainCardinalityChange}
                        withOverride={domainCardinalityOverride}
                    />
                </DialogDetailRow>
            }
        </>
    );
};

const renderAttributeRange = (props: DomainRangeComponentType, Component: (props: SelectType) => JSX.Element) => {

    const rangeOverride = props.withOverride === undefined ? undefined : {
        callback: () =>
            props.withOverride?.setOverriddenFields((prev) => ({
                ...prev,
                range: !prev.range,
                // When we are setting override to false (previous is true), we also set
                // override for cardinality to false.
                rangeCardinality: prev.range ? false : prev.rangeCardinality,
            })),
        defaultValue: props.withOverride.overriddenFields.range,
    };

    return renderRange(props, Component, rangeOverride);
};

const renderRange = (
    props: DomainRangeComponentType,
    Component: (props: SelectType) => JSX.Element,
    rangeOverride?: WithOverrideHandlerType,
) => {

    const rangeCardinalityOverride = props.withOverride === undefined ? undefined : {
        callback: () =>
            props.withOverride?.setOverriddenFields((prev) => ({
                ...prev,
                rangeCardinality: !prev.rangeCardinality,
            })),
        defaultValue: props.withOverride.overriddenFields.rangeCardinality,
    };

    // We show cardinality only when something is selected.
    const showCardinality = !props.hideCardinality && props.range.concept !== null;

    return (
        <>
            <DialogDetailRow detailKey={t("range")}>
                <Component
                    value={props.range.concept}
                    setValue={(identifier) => props.setRange({ ...props.range, concept: identifier })}
                    onChange={props.onRangeChange}
                    disabled={props.withOverride && !props.withOverride.overriddenFields?.range}
                    withOverride={rangeOverride}
                />
            </DialogDetailRow>
            {!showCardinality ? null : (
                <DialogDetailRow detailKey={t("range-cardinality")}>
                    <CardinalityOptions
                        disabled={(props.withOverride && !props.withOverride.overriddenFields?.rangeCardinality) ?? false}
                        group="target"
                        defaultCard={props.range.cardinality}
                        setCardinality={props.setRange}
                        onChange={props.onRangeCardinalityChange}
                        withOverride={rangeCardinalityOverride}
                    />
                </DialogDetailRow>
            )}
        </>
    );
};

const renderAssociationRange = (props: DomainRangeComponentType, Component: (props: SelectType) => JSX.Element) => {

    const rangeOverride = props.withOverride === undefined ? undefined : {
        callback: () =>
            props.withOverride?.setOverriddenFields((prev) => ({
                ...prev,
                range: !prev.range,
            })),
        defaultValue: props.withOverride.overriddenFields.range,
    };

    return renderRange(props, Component, rangeOverride);
};

interface SelectType {
    value: string | null;
    setValue: (iri: string | null) => void;
    onChange?: () => void;
    disabled?: boolean;
    withOverride?: WithOverrideHandlerType;
    withNullValueEnabled?: boolean;
}

const NULL_VALUE = "null";

const NAME_DOMAIN = "domain";

const NAME_RANGE = "range";

const SelectDomainForProfile = (props: SelectType) => {
    const { classes, profiles } = useClassesContext();
    const classProfiles: (SemanticModelClass | SemanticModelClassUsage)[] = [...profiles.filter(isSemanticModelClassUsage)];
    // It may happen, legace reasons, that the current value will be a class, not a profile.
    // In order to support this we check and add it when necessary.
    if (classProfiles.find(item => item.id === props.value) === undefined) {
        // We are missing the class.
        const legacyValue = classes.find(item => item.id === props.value);
        if (legacyValue !== undefined) {
            classProfiles.push(legacyValue);
        }
    }
    const values = prepareSemanticModelEntitiesForSelect(classProfiles);
    return renderSelect(props, NAME_DOMAIN, values);
};

const renderSelect = (props: SelectType, forElement: string, values: SelectItem[]) => {
    const value = props.value == null || props.value == "" ? NULL_VALUE : props.value;

    const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value == NULL_VALUE) {
            props.setValue(null);
        } else {
            props.setValue(e.target.value);
        }
        props.onChange?.();
    };

    return (
        <div className="flex flex-row">
            <div className="flex-grow">
                <select
                    className="w-full"
                    disabled={props.disabled}
                    onChange={onChange}
                    value={value}
                >
                    <option value="null" disabled={!props.withNullValueEnabled}>
                        ---
                    </option>
                    {values.map(item => (
                        <option key={item.identifier} value={item.identifier}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>
            {props.withOverride === undefined ? null : (
                <div className="ml-2">
                    <OverrideFieldCheckbox
                        forElement={`domain-range-component-${forElement}`}
                        onChecked={props.withOverride.callback}
                        defaultChecked={props.withOverride.defaultValue}
                    />
                </div>
            )}
        </div>
    );
};

const SelectDomain = (props: SelectType) => {
    const { classes, profiles } = useClassesContext();
    const classesOrProfiles = [...classes, ...profiles.filter(isSemanticModelClassUsage)];
    const values = prepareSemanticModelEntitiesForSelect(classesOrProfiles);
    return renderSelect(props, NAME_DOMAIN, values);
};

const SelectRangeForAttribute = (props: SelectType) => {
    const values = DataTypeURIs.map(iri => ({
        identifier: iri,
        label: dataTypeUriToName(iri) ?? iri,
    }));
    values.sort((left, right) => left.label.localeCompare(right.label));
    return renderSelect(props, NAME_RANGE, values);
};

const SelectRangeForAssociation = (props: SelectType) => {
    const { classes } = useClassesContext();
    const values = prepareSemanticModelEntitiesForSelect(classes);
    return renderSelect(props, NAME_RANGE, values);
};

const SelectRangeForAssociationProfile = (props: SelectType) => {
    const { classes, profiles } = useClassesContext();
    const classProfiles: (SemanticModelClass | SemanticModelClassUsage)[] = [...profiles.filter(isSemanticModelClassUsage)];
    // It may happen, legace reasons, that the current value will be a class, not a profile.
    // In order to support this we check and add it when necessary.
    if (classProfiles.find(item => item.id === props.value) === undefined) {
        // We are missing the class.
        const legacyValue = classes.find(item => item.id === props.value);
        if (legacyValue !== undefined) {
            classProfiles.push(legacyValue);
        }
    }
    const values = prepareSemanticModelEntitiesForSelect(classProfiles);
    return renderSelect(props, NAME_RANGE, values);
};
