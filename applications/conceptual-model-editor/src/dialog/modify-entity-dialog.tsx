import {
    type LanguageString,
    type SemanticModelClass,
    type SemanticModelRelationship,
    type SemanticModelRelationshipEnd,
    type SemanticModelGeneralization,
    isSemanticModelRelationship,
    isSemanticModelClass,
    isSemanticModelAttribute,
    type SemanticModelEntity,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useMemo, useState } from "react";
import { useClassesContext } from "../context/classes-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { MultiLanguageInputForLanguageString } from "../components/input/multi-language-input-4-language-string";
import { useBaseDialog } from "../components/base-dialog";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipEndUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getIri, getModelIri } from "../util/iri-utils";
import { IriInput } from "../components/input/iri-input";
import { AddAttributesComponent } from "../components/dialog/attributes-component";
import { DomainRangeComponent } from "./components/domain-range-component";
import {
    type Operation,
    createGeneralization,
    createRelationship,
    deleteEntity,
    modifyClass,
    modifyRelation,
} from "@dataspecer/core-v2/semantic-model/operations";
import {
    createRelationshipUsage,
    modifyClassUsage,
    modifyRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/operations";
import { getDescriptionLanguageString, getNameLanguageString } from "../util/name-utils";
import { temporaryDomainRangeHelper } from "../util/relationship-utils";
import { ProfileModificationWarning } from "../features/warnings/profile-modification-warning";
import {
    RemovableAttributeProfileRow,
    RemovableAttributeRow,
} from "../components/dialog/modify/removable-attribute-row";
import { DialogColoredModelHeader } from "../components/dialog/dialog-colored-model-header";
import { DialogDetailRow } from "../components/dialog/dialog-detail-row";
import { MultiLanguageInputForLanguageStringWithOverride } from "../components/input/multi-language-input-4-language-string-with-override";
import {
    NewRemovableAttributeProfileRow,
    NewRemovableAttributeRow,
} from "../components/dialog/modify/new-attribute-row";
import { type OverriddenFieldsType, getDefaultOverriddenFields, isSemanticProfile } from "../util/profile-utils";
import { EntityProxy, getEntityTypeString } from "../util/detail-utils";
import { CancelButton } from "../components/dialog/buttons/cancel-button";
import { ModifyButton } from "../components/dialog/buttons/modify-button";
import { GeneralizationParentsComponent } from "../components/dialog/generalization-parents-component";
import { useModelGraphContext } from "../context/model-context";
import { t, configuration } from "../application/";
import { type EntityModel } from "@dataspecer/core-v2";
import { getDomainAndRange } from "../service/relationship-service";
import { useOptions } from "../application/options";

type SupportedTypes =
    | SemanticModelClass
    | SemanticModelClassUsage
    | SemanticModelRelationship
    | SemanticModelRelationshipUsage;

export const useModifyEntityDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [modifiedEntity, setModifiedEntity] = useState(null as unknown as SupportedTypes);
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);

    const localClose = () => {
        setModifiedEntity(null as unknown as SemanticModelClass);
        setModel(null as unknown as InMemorySemanticModel);
        close();
    };

    const localOpen = (entity: SupportedTypes, model: InMemorySemanticModel | null = null) => {
        if (!model) {
            localClose();
        }
        setModifiedEntity(entity);
        setModel(model);
        open();
    };

    return {
        isModifyEntityDialogOpen: isOpen,
        closeModifyEntityDialog: localClose,
        openModifyEntityDialog: localOpen,
        ModifyEntityDialog: createModifyEntityDialog(modifiedEntity, BaseDialog, model, close),
    };
};

type ChangedFieldsType = {
    name: boolean,
    description: boolean,
    iri: boolean,
    usageNote: boolean,
    domain: boolean,
    domainCardinality: boolean,
    range: boolean,
    rangeCardinality: boolean,
};

type DomainAndRangeContainer = {
    domain: SemanticModelRelationshipEnd,
    range: SemanticModelRelationshipEnd,
    domainIndex: number,
    rangeIndex: number
};

const createModifyEntityDialog = (
    modifiedEntity: SupportedTypes,
    BaseDialog: React.FC<{ children: React.ReactNode, heading: string }>,
    model: InMemorySemanticModel | null,
    close: () => void,
) => {
    const isClass = isSemanticModelClass(modifiedEntity);
    const isProfile = isSemanticProfile(modifiedEntity);
    const isRelationship = isSemanticModelRelationship(modifiedEntity);
    const isAttribute = isSemanticModelAttribute(modifiedEntity);
    const isClassProfile = isSemanticModelClassUsage(modifiedEntity);
    const isRelationshipProfile = isSemanticModelRelationshipUsage(modifiedEntity);
    const isAttributeProfile = isSemanticModelAttributeUsage(modifiedEntity);

    const ModifyEntityDialog = () => {
        const { executeMultipleOperations } = useClassesContext();
        const { language: preferredLanguage } = useOptions();
        const { sourceModelOfEntityMap, deleteEntityFromModel } = useClassesContext();
        const { models } = useModelGraphContext();

        // Common edit section.
        const [iri, setIri] = useState(getIri(modifiedEntity) ?? undefined);
        const [name, setName] = useState(getEntityNameOrEmpty(modifiedEntity));
        const [description, setDescription] = useState(getEntityDescriptionOrEmpty(modifiedEntity));
        const [usageNote, setUsageNote] = useState(getEntityUsageNoteOrEmpty(modifiedEntity));

        // Access to effective values of the modified entity.
        // const {
        //     attributes,
        //     attributeProfiles,
        //     canHaveAttributes,
        //     canHaveDomainAndRange,
        //     profileOf,
        //     specializationOfAsGeneralizations,
        // } = EntityProxy(modifiedEntity);

        const effectiveEntity = EntityProxy(modifiedEntity); // Proxy object with inherited valus.
        const originalEntity = effectiveEntity.raw; // This can have null values unlike the 'modifiedEntity'.

        const currentDomainAndRange = effectiveEntity.canHaveDomainAndRange ? temporaryDomainRangeHelper(modifiedEntity) : null;
        const [newDomain, setNewDomain] = useState(currentDomainAndRange?.domain ?? ({} as SemanticModelRelationshipEnd));
        const [newRange, setNewRange] = useState(currentDomainAndRange?.range ?? ({} as SemanticModelRelationshipEnd));
        const [wantsToAddNewAttributes, setWantsToAddNewAttributes] = useState(false);
        const [newAttributes, setNewAttributes] = useState<Partial<Omit<SemanticModelRelationship, "type">>[]>([]);
        const [newAttributeProfiles, setNewAttributeProfiles] = useState<(Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">)[]>([]);
        const [toBeRemovedAttributes, setToBeRemovedAttributes] = useState<string[]>([]);
        const [newGeneralizations, setNewGeneralizations] = useState<Omit<SemanticModelGeneralization, "type" | "id">[]>([]);
        const [toBeRemovedSpecializations, setToBeRemovedSpecializations] = useState<string[]>([]);
        const [changedFields, setChangedFields] = useState<ChangedFieldsType>({
            name: false,
            description: false,
            iri: false,
            usageNote: false,
            domain: false,
            domainCardinality: false,
            range: false,
            rangeCardinality: false,
        });

        const modelIri = useMemo(() => getModelIri(model), []);

        const [overriddenFields, setOverriddenFields] = useState(getInitialOverriddenFields(originalEntity as SupportedTypes, isProfile));

        const changedFieldsAsStringArray = Object.entries(changedFields)
            .filter(([key, _]) => key != "name" && key != "description" && key != "iri" && key != "usageNote")
            .filter(([_, v]) => v == true)
            .map(([key, _]) => key);

        const { heading, hideCardinality } = prepareDialogOptions(
            isClass, isClassProfile, isRelationship, isAttribute, isRelationshipProfile, isAttributeProfile);

        const handleSaveButtonClicked = () => {
            if (model === null) {
                alert("Model is null!");
                close();
                return;
            }
            const initialOverride = getInitialOverriddenFields(originalEntity as SupportedTypes, isProfile);
            const operations: Operation[] = [];
            if (isSemanticModelClass(modifiedEntity)) {
                operations.push(...classChangesToOperations(
                    modifiedEntity, changedFields,
                    iri, name, description));
            } else if (isSemanticModelClassUsage(modifiedEntity)) {
                operations.push(...classUsageChangesToOperations(
                    modifiedEntity, changedFields, overriddenFields, initialOverride,
                    iri, name, description, usageNote));
            } else if (isSemanticModelRelationship(modifiedEntity)) {
                operations.push(...relationshipChangesToOperations(
                    modifiedEntity, changedFields,
                    iri, name, description, newDomain, newRange, currentDomainAndRange));
            } else if (isSemanticModelRelationshipUsage(modifiedEntity)) {
                operations.push(...relationshipUsageChangesToOperations(
                    modifiedEntity, changedFields, overriddenFields, initialOverride,
                    iri, name, description, newDomain, newRange, currentDomainAndRange, usageNote));
            }
            operations.push(...getAdditionalOperationsToExecute(
                model, models, sourceModelOfEntityMap, modifiedEntity, newAttributes,
                newAttributeProfiles, newGeneralizations, toBeRemovedAttributes, toBeRemovedAttributes,
                deleteEntityFromModel,
            ));
            // Make it happen.
            executeMultipleOperations(model, operations);
            close();
        };

        return (
            <BaseDialog heading={heading} >
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
                                ls={name}
                                setLs={setName}
                                defaultLang={preferredLanguage}
                                disabled={isProfile && !overriddenFields.name}
                                onChange={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                                withOverride={
                                    isProfile
                                        ? {
                                            callback: () =>
                                                setOverriddenFields((prev) => ({ ...prev, name: !prev.name })),
                                            defaultValue: overriddenFields.name,
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
                                name={name}
                                iriHasChanged={true}
                                newIri={iri}
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
                                currentParentsAsGeneralizations={effectiveEntity.specializationOfAsGeneralizations}
                                toBeRemovedGeneralizationParents={toBeRemovedSpecializations}
                                existingParentRemoveButtonClick={(genId) =>
                                    setToBeRemovedSpecializations((prev) => {
                                        if (prev.includes(genId)) {
                                            return prev.filter((g) => g != genId);
                                        }
                                        return prev.concat(genId);
                                    })
                                }
                                newGeneralizationParents={newGeneralizations}
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
                                ls={description}
                                setLs={setDescription}
                                defaultLang={preferredLanguage}
                                disabled={isProfile && !overriddenFields.description}
                                onChange={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                                withOverride={
                                    isProfile
                                        ? {
                                            callback: () =>
                                                setOverriddenFields((prev) => ({
                                                    ...prev,
                                                    description: !prev.description,
                                                })),
                                            defaultValue: overriddenFields.description,
                                        }
                                        : undefined
                                }
                            />
                        </DialogDetailRow>

                        {isProfile && (
                            <DialogDetailRow detailKey={t("modify-entity-dialog.usage-note")}>
                                <MultiLanguageInputForLanguageString
                                    inputType="text"
                                    ls={usageNote}
                                    setLs={setUsageNote}
                                    defaultLang={preferredLanguage}
                                    onChange={() => setChangedFields((prev) => ({ ...prev, usageNote: true }))}
                                />
                            </DialogDetailRow>
                        )}

                        {/*
                        --------------------------------------
                        Attributes for class and class profile
                        --------------------------------------
                        */}

                        {effectiveEntity.canHaveAttributes && (
                            <>
                                <DialogDetailRow style="flex flex-col" detailKey={t("modify-entity-dialog.attributes")}>
                                    <>
                                        {effectiveEntity.attributes.map((v) => (
                                            <RemovableAttributeRow
                                                attribute={v}
                                                toBeRemoved={toBeRemovedAttributes.includes(v.id)}
                                                addToToBeRemoved={() =>
                                                    setToBeRemovedAttributes((prev) => prev.concat(v.id))
                                                }
                                                key={"to-be-removed" + v.id}
                                            />
                                        ))}
                                        {newAttributes.map((a, i) => (
                                            <NewRemovableAttributeRow
                                                key={"new-removable-attribute-" + i.toString()}
                                                attribute={a}
                                                deleteButtonClicked={() => {
                                                    setNewAttributes((prev) => prev.filter((v1) => v1 != a));
                                                }}
                                            />
                                        ))}
                                    </>
                                </DialogDetailRow>
                                <DialogDetailRow style="flex flex-col" detailKey={t("modify-entity-dialog.attributes-profiles")}>
                                    <>
                                        {effectiveEntity.attributeProfiles.map((ap) => (
                                            <RemovableAttributeProfileRow
                                                attribute={ap}
                                                toBeRemoved={toBeRemovedAttributes.includes(ap.id)}
                                                addToToBeRemoved={() =>
                                                    setToBeRemovedAttributes((prev) => prev.concat(ap.id))
                                                }
                                                key={"removable-attribute-profile" + ap.id}
                                            />
                                        ))}

                                        {newAttributeProfiles.map((ap, i) => (
                                            <NewRemovableAttributeProfileRow
                                                key={"new-removable-attribute-profile" + i.toString()}
                                                resource={ap}
                                                deleteButtonClicked={() =>
                                                    setNewAttributeProfiles((prev) => prev.filter((v1) => v1 != ap))
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

                        {effectiveEntity.canHaveDomainAndRange && (
                            <>
                                {isProfile && changedFieldsAsStringArray.length > 0 && (
                                    <>
                                        <DialogDetailRow detailKey="warning">
                                            <ProfileModificationWarning changedFields={changedFieldsAsStringArray} />
                                        </DialogDetailRow>
                                    </>
                                )}
                                <DomainRangeComponent
                                    withOverride={isProfile ? { overriddenFields, setOverriddenFields } : undefined}
                                    entity={
                                        modifiedEntity as SemanticModelRelationship | SemanticModelRelationshipUsage
                                    }
                                    range={newRange}
                                    setRange={setNewRange}
                                    domain={newDomain}
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

                {effectiveEntity.canHaveAttributes && (
                    <div className="bg-slate-100">
                        <div className="my-1 flex flex-row justify-between">
                            <button
                                className="ml-2 bg-white px-1 py-1 hover:shadow-sm md:ml-8 md:px-2"
                                onClick={() => setWantsToAddNewAttributes((prev) => !prev)}
                            >
                                {wantsToAddNewAttributes ? "❌ cancel" : "➕ add attribute"}
                            </button>
                        </div>
                        <div>
                            {wantsToAddNewAttributes && (
                                <AddAttributesComponent
                                    preferredLanguage={preferredLanguage}
                                    sourceModel={model}
                                    modifiedClassId={modifiedEntity.id}
                                    saveNewAttribute={(attribute: Partial<Omit<SemanticModelRelationship, "type">>) => {
                                        setNewAttributes((prev) => prev.concat(attribute));
                                        setWantsToAddNewAttributes(false);
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
                    <ModifyButton
                        onClick={handleSaveButtonClicked}
                        disabled={wantsToAddNewAttributes}
                        title={wantsToAddNewAttributes ? "first save the attribute or cancel the action" : undefined}
                        style="hover:disabled:cursor-not-allowed"
                    />
                    <CancelButton onClick={close} />
                </div>
            </BaseDialog>
        );
    };
    return ModifyEntityDialog;
};

const getEntityNameOrEmpty = (entity: SupportedTypes): LanguageString => {
    return getNameLanguageString(entity) ?? {};
};

const getEntityDescriptionOrEmpty = (entity: SupportedTypes): LanguageString => {
    return getDescriptionLanguageString(entity) ?? {};
};

const getEntityUsageNoteOrEmpty = (entity: SupportedTypes): LanguageString => {
    return isSemanticProfile(entity) ? entity.usageNote ?? {} : {};
};

/**
 * Provide initial override settings.
 */
const getInitialOverriddenFields = (
    entity: SupportedTypes | null,
    isProfile: boolean,
): OverriddenFieldsType => {
    // By default nothing can be changed.
    const result = getDefaultOverriddenFields();
    if (!isProfile) {
        return result;
    }

    result.name = entity?.name !== null;
    result.description = entity?.description !== null;
    if (!isSemanticModelRelationshipUsage(entity)) {
        return result;
    }

    const domainAndRange = getDomainAndRange(entity);
    result.domain = domainAndRange.domain !== null;
    result.domainCardinality = domainAndRange.domain?.cardinality !== null;
    result.range = domainAndRange.range !== null;
    result.rangeCardinality = domainAndRange.range?.cardinality !== null;

    return result;
};

/**
 * Given values and list of changed fields returns operations
 * for updating the class.
 */
const classChangesToOperations = (
    entity: SemanticModelClass,
    changedFields: ChangedFieldsType,
    iri: string | undefined,
    name: LanguageString,
    description: LanguageString,
): Operation[] => {
    const changes = {} as Partial<Omit<SemanticModelClass & SemanticModelClassUsage, "type" | "usageOf" | "id">>;

    if (changedFields.iri) {
        changes.iri = iri;
    }
    if (changedFields.name) {
        changes.name = name;
    }
    if (changedFields.description) {
        changes.description = description;
    }

    if (Object.entries(changes).length > 0) {
        return [modifyClass(entity.id, changes)];
    } else {
        return [];
    }
};

/**
 * Given values and list of changed fields returns operations
 * for updating the class profile.
 *
 * For name and description, also make sure that null is set
 * when method is no overridden.
 */
const classUsageChangesToOperations = (
    entity: SemanticModelClassUsage,
    changedFields: ChangedFieldsType,
    overriddenFields: OverriddenFieldsType,
    initialOverriddenFields: OverriddenFieldsType,
    iri: string | undefined,
    name: LanguageString,
    description: LanguageString,
    usageNote: LanguageString,
): Operation[] => {
    const changes = {} as Partial<Omit<SemanticModelClassUsage, "type" | "usageOf" | "id">>;

    if (changedFields.iri) {
        changes.iri = iri;
    }

    addValueToChangesWhenValueHasChanged(
        changedFields.name, overriddenFields.name, initialOverriddenFields.name,
        name, entity.name,
        changes, "name");
    addValueToChangesWhenValueHasChanged(
        changedFields.description, overriddenFields.description, initialOverriddenFields.description,
        description, entity.description,
        changes, "description");

    if (changedFields.usageNote) {
        changes.usageNote = usageNote;
    }

    // Return operation or nothing.
    if (Object.entries(changes).length > 0) {
        return [modifyClassUsage(entity.id, changes)];
    } else {
        return [];
    }
};

/**
 * Given information about a value write a new value to the changes list
 * under given name if there is a change in the value.
 */
const addValueToChangesWhenValueHasChanged = <T,>(
    hasChanged: boolean,
    overridden: boolean,
    initialOverridden: boolean,
    value: T,
    initialValue: T,
    changes: any,
    name: string,
): void => {
    const next = determineNextValue(hasChanged, overridden, initialOverridden, value);
    if (next.hasChanged) {
        // We could setter function instead, alternatively we should refactor
        // the caller function to deal with this instead.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        changes[name] = next.value;
    }
};

/**
 * Given information about a value determines next value and whether it has changed.
 */
const determineNextValue = <T,>(
    hasChanged: boolean,
    overridden: boolean,
    initialOverridden: boolean,
    value: T,
): {
    value: T | null,
    hasChanged: boolean,
} => {
    // We go case by case.
    if (initialOverridden) {
        if (overridden) {
            // overridden -> overridden
            return { value, hasChanged };
        } else {
            // overridden -> inherit
            return { value: null, hasChanged: true };
        }
    } else {
        if (overridden) {
            // inherit -> overridden
            return { value, hasChanged: true };
        } else {
            // inherit -> inherit
            return { value: null, hasChanged: false };
        }
    }
};

const relationshipChangesToOperations = (
    entity: SemanticModelEntity,
    changedFields: ChangedFieldsType,
    iri: string | undefined,
    name: LanguageString,
    description: LanguageString,
    domain: SemanticModelRelationshipEnd,
    range: SemanticModelRelationshipEnd,
    initialDomainAndRange: DomainAndRangeContainer | null,
): Operation[] => {

    // Get changes for the domain.
    let domainChanges = {} as Partial<Omit<SemanticModelRelationshipEnd, "type" | "id">>;
    domainChanges = changedFields.domainCardinality ? { ...domainChanges, cardinality: domain.cardinality } : domainChanges;
    domainChanges = changedFields.domain ? { ...domainChanges, concept: domain.concept } : domainChanges;

    // Get range changes.
    let rangeChanges = {} as Partial<Omit<SemanticModelRelationshipEnd, "type" | "id">>;
    rangeChanges = changedFields.iri ? { ...rangeChanges, iri: iri } : rangeChanges;
    rangeChanges = changedFields.name ? { ...rangeChanges, name: name } : rangeChanges;
    rangeChanges = changedFields.description ? { ...rangeChanges, description: description } : rangeChanges;
    rangeChanges = changedFields.range ? { ...rangeChanges, concept: range.concept } : rangeChanges;
    rangeChanges = changedFields.rangeCardinality ? { ...rangeChanges, cardinality: range.cardinality } : rangeChanges;

    // Merge original values with the changes, to constrcut full objects.
    const domainEnd: SemanticModelRelationshipEnd = {
        ...initialDomainAndRange!.domain,
        ...domainChanges,
    };
    const rangeEnd: SemanticModelRelationshipEnd = {
        ...initialDomainAndRange!.range,
        ...rangeChanges,
    };

    // Keep the same order of domain and range.
    let ends: SemanticModelRelationshipEnd[];
    if (initialDomainAndRange?.domainIndex == 1 && initialDomainAndRange?.rangeIndex == 0) {
        ends = [rangeEnd, domainEnd];
    } else {
        ends = [domainEnd, rangeEnd];
    }

    return [modifyRelation(entity.id, { ends })];
};

/**
 * Just a function where to dump anything that does not fit into other
 * any to operations functions.
 *
 * We should split this functions into logical parts and call the section from their respective parts.
 */
const getAdditionalOperationsToExecute = (
    model: InMemorySemanticModel,
    modelMap: Map<string, EntityModel>,
    entityToModelIdentifier: Map<string, string>,
    entity: SemanticModelEntity,
    newAttributes: Partial<Omit<SemanticModelRelationship, "type">>[],
    newAttributeProfiles: (Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">)[],
    newGeneralizations: Omit<SemanticModelGeneralization, "type" | "id">[],
    attributesToBeRemoved: string[],
    specializationsTobeRemoved: string[],
    deleteEntityFromModel: (model: InMemorySemanticModel, identifier: string) => void,
) => {
    const operations = [];
    if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
        for (const attribute of newAttributes) {
            operations.push(createRelationship(attribute));
        }
        for (const attributeProfile of newAttributeProfiles) {
            operations.push(createRelationshipUsage(attributeProfile));
        }
    }

    for (const Generalization of newGeneralizations) {
        operations.push(createGeneralization(Generalization));
    }

    // Attributes and generalizations can be from different models.
    // For such occasions they need to be removed from the model directly.
    for (const identifier of [...attributesToBeRemoved, ...specializationsTobeRemoved]) {
        const modelIdentifier = entityToModelIdentifier.get(identifier);
        if (modelIdentifier === undefined) {
            operations.push(deleteEntity(identifier));
            continue;
        }
        const ownerModel = modelMap.get(modelIdentifier);
        if (ownerModel instanceof InMemorySemanticModel && ownerModel.getId() != model?.getId()) {
            // We can delete directly .. not sure why.
            // TODO We should probably not do this, not sure why it is this way.
            deleteEntityFromModel(ownerModel, identifier);
        } else {
            operations.push(deleteEntity(identifier));
        }
    }
    return operations;
};

const relationshipUsageChangesToOperations = (
    entity: SemanticModelEntity,
    changedFields: ChangedFieldsType,
    overriddenFields: OverriddenFieldsType,
    initialOverriddenFields: OverriddenFieldsType,
    iri: string | undefined,
    name: LanguageString,
    description: LanguageString,
    domain: SemanticModelRelationshipEnd,
    range: SemanticModelRelationshipEnd,
    initialDomainAndRange: DomainAndRangeContainer | null,
    usageNote: LanguageString,
) => {
    // Get changes for the domain.
    const domainChanges = {} as Partial<Omit<SemanticModelRelationshipEndUsage, "type" | "id">>;
    addValueToChangesWhenValueHasChanged(
        changedFields.domain, overriddenFields.domain, initialOverriddenFields.domain,
        domain.concept, initialDomainAndRange?.domain.concept,
        domainChanges, "concept");
    addValueToChangesWhenValueHasChanged(
        changedFields.domainCardinality, overriddenFields.domainCardinality, initialOverriddenFields.domainCardinality,
        domain.cardinality, initialDomainAndRange?.domain.cardinality,
        domainChanges, "cardinality");

    // Get range changes.
    let rangeChanges = {} as Partial<Omit<SemanticModelRelationshipEndUsage, "type" | "id">>;
    rangeChanges = changedFields.iri ? { ...rangeChanges, iri: iri } : rangeChanges;
    addValueToChangesWhenValueHasChanged(
        changedFields.name, overriddenFields.name, initialOverriddenFields.name,
        name, range.name,
        rangeChanges, "name");
    addValueToChangesWhenValueHasChanged(
        changedFields.description, overriddenFields.description, initialOverriddenFields.description,
        description, range.description,
        rangeChanges, "description");
    addValueToChangesWhenValueHasChanged(
        changedFields.range, overriddenFields.range, initialOverriddenFields.range,
        range.concept, initialDomainAndRange?.range.concept,
        rangeChanges, "concept");
    addValueToChangesWhenValueHasChanged(
        changedFields.rangeCardinality, overriddenFields.rangeCardinality, initialOverriddenFields.rangeCardinality,
        range.cardinality, initialDomainAndRange?.range.cardinality,
        rangeChanges, "cardinality");
    rangeChanges = changedFields.usageNote ? { ...rangeChanges, usageNote: usageNote } : rangeChanges;

    // Copy only the changes (use what raw entity provided).
    const domainEnd = {
        ...initialDomainAndRange!.domain,
        ...domainChanges,
    } as SemanticModelRelationshipEndUsage;

    const rangeEnd = {
        ...initialDomainAndRange!.range,
        ...rangeChanges,
    } as SemanticModelRelationshipEndUsage;

    // Keep the same order of domain and range.
    let ends: SemanticModelRelationshipEndUsage[];
    if (initialDomainAndRange?.domainIndex == 1 && initialDomainAndRange?.rangeIndex == 0) {
        ends = [rangeEnd, domainEnd];
    } else {
        ends = [domainEnd, rangeEnd];
    }

    return [modifyRelationshipUsage(entity.id, { ends })];
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
