import { useMemo } from "react";

import {
    type LanguageString,
    type SemanticModelClass,
    type SemanticModelRelationship,
    type SemanticModelRelationshipEnd,
    type SemanticModelGeneralization,
    isSemanticModelRelationship,
    isSemanticModelClass,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";

import { ClassesContextType } from "../../context/classes-context";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
    SemanticModelRelationshipEndUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getIri, getModelIri } from "../../util/iri-utils";
import { IriInput } from "../../components/input/iri-input";
import { AddAttributesComponent } from "../../components/dialog/attributes-component";
import { DomainRangeComponent } from "../components/domain-range-component";
import { getDescriptionLanguageString, getNameLanguageString } from "../../util/name-utils";
import { ProfileModificationWarning } from "../../features/warnings/profile-modification-warning";
import {
    RemovableAttributeProfileRow,
    RemovableAttributeRow,
} from "../../components/dialog/modify/removable-attribute-row";
import { DialogColoredModelHeader } from "../../components/dialog/dialog-colored-model-header";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { MultiLanguageInputForLanguageStringWithOverride } from "../../components/input/multi-language-input-4-language-string-with-override";
import {
    NewRemovableAttributeProfileRow,
    NewRemovableAttributeRow,
} from "../../components/dialog/modify/new-attribute-row";
import { type OverriddenFieldsType, getDefaultOverriddenFields, isSemanticProfile } from "../../util/profile-utils";
import { EntityDetailProxy, createEntityProxy, getEntityTypeString } from "../../util/detail-utils";
import { GeneralizationParentsComponent } from "../../components/dialog/generalization-parents-component";
import { ModelGraphContextType, useModelGraphContext } from "../../context/model-context";
import { t, configuration } from "../../application";
import { getDomainAndRange } from "../../util/relationship-utils";
import { DialogProps, DialogWrapper } from "../dialog-api";
import { findSourceModelOfEntity } from "../../service/model-service";

export type SupportedTypes =
    | SemanticModelClass
    | SemanticModelClassUsage
    | SemanticModelRelationship
    | SemanticModelRelationshipUsage;

export interface ModifyEntityState {

    entity: SupportedTypes;

    language: string;

    wantsToAddNewAttributes: boolean;

    //

    entityProxy: EntityDetailProxy;

    aggregatedEntity: AggregatedEntityWrapper

    initialOverriddenFields: OverriddenFieldsType;

    // State from the dialog.

    isProfile: boolean;

    iri: string;

    name: LanguageString;

    description: LanguageString;

    usageNote: LanguageString;

    domain: SemanticModelRelationshipEnd | SemanticModelRelationshipEndUsage;

    range: SemanticModelRelationshipEnd | SemanticModelRelationshipEndUsage;

    newAttributes: Partial<Omit<SemanticModelRelationship, "type">>[];

    newAttributesProfile: (Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">)[];

    attributesToRemove: string[];

    newGeneralizations: Omit<SemanticModelGeneralization, "type" | "id">[];

    specializationsToRemove: string[];

    changedFields: ChangedFieldsType;

    overriddenFields: OverriddenFieldsType;

}

export const createEntityModifyDialog = (
    classes: ClassesContextType,
    graph: ModelGraphContextType,
    entity: SupportedTypes,
    language: string,
    onConfirm: (state: ModifyEntityState) => void,
): DialogWrapper<ModifyEntityState> => {
    const entityProxy = createEntityProxy(classes, graph, entity);
    const aggregatedEntity = graph.aggregatorView.getEntities()[entity.id];

    return {
        label: selectLabel(aggregatedEntity),
        component: ModifyEntityDialog,
        state: createModifyEntityDialogState(entityProxy, aggregatedEntity, entity, language),
        confirmLabel: "modify-dialog.btn-ok",
        cancelLabel: "modify-dialog.btn-close",
        validate: (state) => !state.wantsToAddNewAttributes,
        onConfirm: onConfirm,
        onClose: null,
    };
}

function selectLabel(aggregatedEntity: AggregatedEntityWrapper) {
    const entity = aggregatedEntity.aggregatedEntity;
    if (isSemanticModelAttribute(entity)) {
        return "modify-dialog.title.attribute";
    } else if (isSemanticModelRelationship(entity)) {
        return "modify-dialog.title.relationship";
    } else if (isSemanticModelAttributeUsage(entity)) {
        return "modify-dialog.title.attribute-profile";
    } else if (isSemanticModelClassUsage(entity)) {
        return "modify-dialog.title.class-profile";
    } else if (isSemanticModelRelationshipUsage(entity)) {
        return "modify-dialog.title.relationship-profile";
    } else if (isSemanticModelClass(entity)) {
        return "modify-dialog.title.class";
    } else {
        return "modify-dialog.title.unknown";
    }
};

function createModifyEntityDialogState(
    entityProxy: EntityDetailProxy,
    aggregatedEntity: AggregatedEntityWrapper,
    entity: SupportedTypes,
    language: string,
): ModifyEntityState {
    const isProfile = isSemanticProfile(entity);

    let domainAndRange = null;
    if (isSemanticModelRelationship(entity)) {
        domainAndRange = getDomainAndRange(entity);
    } else if (isSemanticModelRelationshipUsage(entity)) {
        domainAndRange = getDomainAndRange(entity);
    }

    return {
        entity,
        language,
        wantsToAddNewAttributes: false,
        //
        entityProxy: entityProxy,
        aggregatedEntity: aggregatedEntity,
        initialOverriddenFields: getInitialOverriddenFields(entity, isProfile),
        //
        isProfile: isProfile,
        iri: getIri(entity) ?? "",
        name: getEntityNameOrEmpty(entity),
        description: getEntityDescriptionOrEmpty(entity),
        usageNote: getEntityUsageNoteOrEmpty(entity),
        domain: domainAndRange?.domain ?? {} as SemanticModelRelationshipEnd,
        range: domainAndRange?.range ?? {} as SemanticModelRelationshipEnd,
        newAttributes: [],
        newAttributesProfile: [],
        attributesToRemove: [],
        newGeneralizations: [],
        specializationsToRemove: [],
        changedFields: {
            name: false,
            description: false,
            iri: false,
            usageNote: false,
            domain: false,
            domainCardinality: false,
            range: false,
            rangeCardinality: false,
        },
        // We do not use the same object as above.
        overriddenFields: getInitialOverriddenFields(entity, isProfile),
    };
}

const getEntityNameOrEmpty = (entity: SupportedTypes): LanguageString => {
    return getNameLanguageString(entity) ?? {};
};

const getEntityDescriptionOrEmpty = (entity: SupportedTypes): LanguageString => {
    return getDescriptionLanguageString(entity) ?? {};
};

const getEntityUsageNoteOrEmpty = (entity: SupportedTypes): LanguageString => {
    return isSemanticProfile(entity) ? entity.usageNote ?? {} : {};
};

export type ChangedFieldsType = {
    name: boolean,
    description: boolean,
    iri: boolean,
    usageNote: boolean,
    domain: boolean,
    domainCardinality: boolean,
    range: boolean,
    rangeCardinality: boolean,
};

export type DomainAndRangeContainer = {
    domain: SemanticModelRelationshipEnd,
    range: SemanticModelRelationshipEnd,
    domainIndex: number,
    rangeIndex: number
};

const ModifyEntityDialog = (props: DialogProps<ModifyEntityState>) => {
    const modifiedEntity = props.state.entity;

    const isClass = isSemanticModelClass(modifiedEntity);
    const isProfile = isSemanticProfile(modifiedEntity);
    const isRelationship = isSemanticModelRelationship(modifiedEntity);
    const isAttribute = isSemanticModelAttribute(modifiedEntity);
    const isClassProfile = isSemanticModelClassUsage(modifiedEntity);
    const isRelationshipProfile = isSemanticModelRelationshipUsage(modifiedEntity);
    const isAttributeProfile = isSemanticModelAttributeUsage(modifiedEntity);

    const { models } = useModelGraphContext();
    const model = findSourceModelOfEntity(modifiedEntity.id, models);

    const setIri = (next: string) =>
        props.changeState(prev => ({ ...prev, iri: next }));
    const setName = (setter: (prev: LanguageString) => LanguageString) =>
        props.changeState(prev => ({ ...prev, name: setter(prev.name) }));
    const setDescription = (setter: (prev: LanguageString) => LanguageString) =>
        props.changeState(prev => ({ ...prev, description: setter(prev.description) }));
    const setUsageNote = (setter: (prev: LanguageString) => LanguageString) =>
        props.changeState(prev => ({ ...prev, usageNote: setter(prev.usageNote) }));
    const toggleWantsToAddNewAttributes = () =>
        props.changeState(state => ({ ...state, wantsToAddNewAttributes: !state.wantsToAddNewAttributes }));
    const setNewDomain = (setter: (prev: SemanticModelRelationshipEnd | SemanticModelRelationshipEndUsage) => SemanticModelRelationshipEnd | SemanticModelRelationshipEndUsage) =>
        props.changeState(state => ({ ...state, domain: setter(state.domain) }));
    const setNewRange = (setter: (prev: SemanticModelRelationshipEnd | SemanticModelRelationshipEndUsage) => SemanticModelRelationshipEnd | SemanticModelRelationshipEndUsage) =>
        props.changeState(state => ({ ...state, range: setter(state.range) }));
    const setNewAttributes = (setter: (prev: Partial<Omit<SemanticModelRelationship, "type">>[]) => Partial<Omit<SemanticModelRelationship, "type">>[]) =>
        props.changeState(state => ({ ...state, newAttributes: setter(state.newAttributes) }));

    type AttributeProfiles = Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">[];
    const setNewAttributeProfiles = (setter: (prev: AttributeProfiles) => AttributeProfiles) =>
        props.changeState(state => ({ ...state, newAttributesProfile: setter(state.newAttributesProfile) }));
    const setToBeRemovedAttributes = (setter: (prev: string[]) => string[]) =>
        props.changeState(state => ({ ...state, attributesToRemove: setter(state.attributesToRemove) }));
    const setToBeRemovedSpecializations = (setter: (prev: string[]) => string[]) =>
        props.changeState(state => ({ ...state, specializationsToRemove: setter(state.specializationsToRemove) }));
    const setChangedFields = (setter: (prev: ChangedFieldsType) => ChangedFieldsType) =>
        props.changeState(state => ({ ...state, changedFields: setter(state.changedFields) }));
    const setOverriddenFields = (setter: (prev: OverriddenFieldsType) => OverriddenFieldsType) =>
        props.changeState(state => ({ ...state, overriddenFields: setter(state.overriddenFields) }));
    const setNewGeneralizations = (setter: (prev: Omit<SemanticModelGeneralization, "type" | "id">[]) => Omit<SemanticModelGeneralization, "type" | "id">[]) =>
        props.changeState(state => ({ ...state, newGeneralizations: setter(state.newGeneralizations) }));

    const state = props.state;

    //

    const modelIri = useMemo(() => getModelIri(model), []);

    const changedFieldsAsStringArray = Object.entries(state.changedFields)
        .filter(([key, _]) => key != "name" && key != "description" && key != "iri" && key != "usageNote")
        .filter(([_, v]) => v == true)
        .map(([key, _]) => key);

    const { hideCardinality } = prepareDialogOptions(
        isClass, isClassProfile, isRelationship, isAttribute,
        isRelationshipProfile, isAttributeProfile);

    return (
        <>
            <div>
                <DialogColoredModelHeader
                    activeModel={model}
                    style="grid grid-cols-1 px-1 md:grid-cols-[25%_75%] gap-y-3 bg-slate-100 md:pl-8 md:pr-16 md:pb-4 md:pt-2"
                />
                <div className="grid grid-cols-1 gap-y-3 bg-slate-100 px-1 md:grid-cols-[25%_75%] md:pl-8 md:pr-16 my-2 py-2">
                    {/*
                    ---------
                    Entity name
                    ---------
                    */}

                    <DialogDetailRow detailKey={t("modify-entity-dialog.type")}>
                        <MultiLanguageInputForLanguageStringWithOverride
                            style="text-xl"
                            forElement="modify-entity-name"
                            inputType="text"
                            ls={state.name}
                            setLs={setName}
                            defaultLang={props.state.language}
                            disabled={isProfile && !state.overriddenFields.name}
                            onChange={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                            withOverride={
                                isProfile
                                    ? {
                                        callback: () =>
                                            setOverriddenFields((prev) => ({ ...prev, name: !prev.name })),
                                        defaultValue: state.overriddenFields.name,
                                    }
                                    : undefined
                            }
                        />
                    </DialogDetailRow>

                    {/*
                    ---------
                    Entity id
                    ---------
                    */}

                    {configuration().hideIdentifier ? null :
                        <DialogDetailRow detailKey={t("modify-entity-dialog.id")}>{modifiedEntity.id}</DialogDetailRow>
                    }

                    {/*
                    ----------
                    Entity IRI
                    ----------
                    */}

                    <DialogDetailRow detailKey={t("modify-entity-dialog.iri")}>
                        <IriInput
                            name={state.name}
                            iriHasChanged={true}
                            newIri={state.iri}
                            setNewIri={setIri}
                            onChange={() => setChangedFields((prev) => ({ ...prev, iri: true }))}
                            baseIri={modelIri}
                        />
                    </DialogDetailRow>

                    {/*
                    ----------
                    Entity generalizations
                    ----------
                    */}

                    <DialogDetailRow detailKey={t(isRelationship || isRelationshipProfile ?
                        "modify-entity-dialog.specialization-of-property" :
                        "modify-entity-dialog.specialization-of")}>
                        <GeneralizationParentsComponent
                            modifiedEntityId={modifiedEntity.id}
                            modifiedEntityType={getEntityTypeString(modifiedEntity)}
                            currentParentsAsGeneralizations={state.entityProxy.specializationOfAsGeneralizations}
                            toBeRemovedGeneralizationParents={state.specializationsToRemove}
                            existingParentRemoveButtonClick={(genId) =>
                                setToBeRemovedSpecializations((prev) => {
                                    if (prev.includes(genId)) {
                                        return prev.filter((g) => g != genId);
                                    }
                                    return prev.concat(genId);
                                })
                            }
                            newGeneralizationParents={state.newGeneralizations}
                            addNewGeneralizationParent={(gen) => setNewGeneralizations((prev) => prev.concat(gen))}
                            removeNewGeneralizationParent={(gen) =>
                                setNewGeneralizations((prev) => prev.filter((g) => g != gen))
                            }
                        />
                    </DialogDetailRow>

                    {/*
                    ------------------
                    Entity description
                    ------------------
                    */}

                    <DialogDetailRow detailKey={t("modify-entity-dialog.description")}>
                        <MultiLanguageInputForLanguageStringWithOverride
                            forElement="modify-entity-description"
                            inputType="textarea"
                            ls={state.description}
                            setLs={setDescription}
                            defaultLang={props.state.language}
                            disabled={isProfile && !state.overriddenFields.description}
                            onChange={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                            withOverride={
                                isProfile
                                    ? {
                                        callback: () => setOverriddenFields((prev) => ({
                                            ...prev, description: !prev.description,
                                        })),
                                        defaultValue: state.overriddenFields.description,
                                    }
                                    : undefined
                            }
                        />
                    </DialogDetailRow>

                    {isProfile && (
                        <DialogDetailRow detailKey={t("modify-entity-dialog.usage-note")}>
                            <MultiLanguageInputForLanguageString
                                inputType="text"
                                ls={state.usageNote}
                                setLs={setUsageNote}
                                defaultLang={props.state.language}
                                onChange={() => setChangedFields((prev) => ({ ...prev, usageNote: true }))}
                            />
                        </DialogDetailRow>
                    )}

                    {/*
                    --------------------------------------
                    Attributes for class and class profile
                    --------------------------------------
                    */}

                    {state.entityProxy.canHaveAttributes && (
                        <>
                            <DialogDetailRow className="flex flex-col" detailKey={t("modify-entity-dialog.attributes")}>
                                <>
                                    {state.entityProxy.attributes.map((v) => (
                                        <RemovableAttributeRow
                                            attribute={v}
                                            toBeRemoved={state.attributesToRemove.includes(v.id)}
                                            addToToBeRemoved={() =>
                                                setToBeRemovedAttributes((prev) => prev.concat(v.id))
                                            }
                                            key={"to-be-removed" + v.id}
                                        />
                                    ))}
                                    {state.newAttributes.map((attribute, index) => (
                                        <NewRemovableAttributeRow
                                            key={"new-removable-attribute-" + index.toString()}
                                            attribute={attribute}
                                            deleteButtonClicked={() => {
                                                setNewAttributes((prev) => prev.filter((v1) => v1 != attribute));
                                            }}
                                        />
                                    ))}
                                </>
                            </DialogDetailRow>
                            <DialogDetailRow className="flex flex-col" detailKey={t("modify-entity-dialog.attributes-profiles")}>
                                <>
                                    {state.entityProxy.attributeProfiles.map((ap) => (
                                        <RemovableAttributeProfileRow
                                            attribute={ap}
                                            toBeRemoved={state.attributesToRemove.includes(ap.id)}
                                            addToToBeRemoved={() =>
                                                setToBeRemovedAttributes((prev) => prev.concat(ap.id))
                                            }
                                            key={"removable-attribute-profile" + ap.id}
                                        />
                                    ))}

                                    {state.newAttributesProfile.map((attribute, index) => (
                                        <NewRemovableAttributeProfileRow
                                            key={"new-removable-attribute-profile" + index.toString()}
                                            resource={attribute}
                                            deleteButtonClicked={() =>
                                                setNewAttributeProfiles((prev) => prev.filter((v1) => v1 != attribute))
                                            }
                                        />
                                    ))}
                                </>
                            </DialogDetailRow>
                        </>
                    )}

                    {/*
                    -----------------------------------------------------------
                    Range and domain for a relationship or relationship profile
                    -----------------------------------------------------------
                    */}

                    {state.entityProxy.canHaveDomainAndRange && (
                        <>
                            {isProfile && changedFieldsAsStringArray.length > 0 && (
                                <>
                                    <DialogDetailRow detailKey="warning">
                                        <ProfileModificationWarning changedFields={changedFieldsAsStringArray} />
                                    </DialogDetailRow>
                                </>
                            )}
                            <DomainRangeComponent
                                withOverride={isProfile ? { overriddenFields: state.overriddenFields, setOverriddenFields } : undefined}
                                entity={
                                    modifiedEntity as SemanticModelRelationship | SemanticModelRelationshipUsage
                                }
                                range={state.range!}
                                setRange={setNewRange}
                                domain={state.domain!}
                                setDomain={setNewDomain}
                                onDomainChange={() => setChangedFields((prev) => ({ ...prev, domain: true }))}
                                onDomainCardinalityChange={() =>
                                    setChangedFields((prev) => ({ ...prev, domainCardinality: true }))
                                }
                                onRangeChange={() => setChangedFields((prev) => ({ ...prev, range: true }))}
                                onRangeCardinalityChange={() =>
                                    setChangedFields((prev) => ({ ...prev, rangeCardinality: true }))
                                }
                                hideCardinality={hideCardinality}
                                isProfile={isProfile}
                                isAttribute={isAttribute || isAttributeProfile}
                            />
                        </>
                    )}
                </div>
            </div>

            {/*
            -----------------------------------------------------
            Adding new attributes to class or class profile
            -----------------------------------------------------
            */}

            {state.entityProxy.canHaveAttributes && (
                <div className="bg-slate-100">
                    <div className="my-1 flex flex-row justify-between">
                        <button
                            className="ml-2 bg-white px-1 py-1 hover:shadow-sm md:ml-8 md:px-2"
                            onClick={toggleWantsToAddNewAttributes}
                        >
                            {state.wantsToAddNewAttributes ? "❌ cancel" : "➕ add attribute"}
                        </button>
                    </div>
                    <div>
                        {state.wantsToAddNewAttributes && (
                            <AddAttributesComponent
                                preferredLanguage={props.state.language}
                                sourceModel={model}
                                modifiedClassId={modifiedEntity.id}
                                saveNewAttribute={(attribute: Partial<Omit<SemanticModelRelationship, "type">>) => {
                                    setNewAttributes((prev) => prev.concat(attribute));
                                    toggleWantsToAddNewAttributes();
                                }}
                                hideCardinality={hideCardinality}
                            />
                        )}
                    </div>
                </div>
            )}

            {/*
            ----------------------------
            Save and cancel button group
            ----------------------------
            */}

            <div className="mt-auto flex flex-row justify-evenly font-semibold">
                {state.wantsToAddNewAttributes ? "First save the attribute or cancel the action." : null}
            </div>
        </>
    );
};

/**
 * Provide initial override settings.
 */
export const getInitialOverriddenFields = (
    entity: SupportedTypes | null,
    isProfile: boolean,
): OverriddenFieldsType => {
    // By default nothing can be changed.
    const result = getDefaultOverriddenFields();
    if (!isProfile) {
        return result;
    }

    if (isSemanticModelRelationshipUsage(entity)) {
        const domainAndRange = getDomainAndRange(entity);
        // Name and description are stored using the range.
        result.name = domainAndRange.range?.name !== null;
        result.description = domainAndRange.range?.description !== null;

        result.domain = domainAndRange.domain !== null;
        result.domainCardinality = domainAndRange.domain?.cardinality !== null;
        result.range = domainAndRange.range !== null;
        result.rangeCardinality = domainAndRange.range?.cardinality !== null;

        return result;
    } else {
        result.name = entity?.name !== null;
        result.description = entity?.description !== null;

        return result;
    }
};

const prepareDialogOptions = (
    isClass: boolean,
    isClassProfile: boolean,
    isRelationshipOrAttribute: boolean,
    isAttribute: boolean,
    isRelationshipOrAttributeProfile: boolean,
    isAttributeProfile: boolean,
): {
    heading: string,
    hideCardinality: boolean,
} => {
    let heading = "";
    let hideCardinality = false;

    if (isClass) {
        heading = t("modify-entity-dialog.label-class");
    } else if (isClassProfile) {
        heading = t("modify-entity-dialog.label-class-profile");
    } else if (isRelationshipOrAttribute) {
        if (isAttribute) {
            heading = t("modify-entity-dialog.label-attribute");
        } else {
            heading = t("modify-entity-dialog.label-relationship");
        }
        hideCardinality = configuration().hideRelationCardinality;
    } else if (isRelationshipOrAttributeProfile) {
        if (isAttributeProfile) {
            heading = t("modify-entity-dialog.label-attribute-profile");
        } else {
            heading = t("modify-entity-dialog.label-relationship-profile");
        }
    } else {
        heading = "Not sure ...";
    }

    return {
        heading,
        hideCardinality,
    };
};
