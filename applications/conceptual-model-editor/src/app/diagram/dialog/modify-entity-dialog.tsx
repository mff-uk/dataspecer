import {
    type LanguageString,
    type SemanticModelClass,
    type SemanticModelRelationship,
    type SemanticModelRelationshipEnd,
    type SemanticModelGeneralization,
    isSemanticModelRelationship,
    isSemanticModelClass,
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
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useConfigurationContext } from "../context/configuration-context";
import { getIri, getModelIri } from "../util/iri-utils";
import { IriInput } from "../components/input/iri-input";
import { AddAttributesComponent } from "../components/dialog/attributes-component";
import { DomainRangeComponent } from "./domain-range-component";
import {
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
import { areLanguageStringsEqual } from "../util/language-utils";
import { GeneralizationParentsComponent } from "../components/dialog/generalization-parents-component";
import { useModelGraphContext } from "../context/model-context";
import { t } from "../application/";

type SupportedTypes =
    | SemanticModelClass
    | SemanticModelClassUsage
    | SemanticModelRelationship
    | SemanticModelRelationshipUsage;

export const useModifyEntityDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [modifiedEntity, setModifiedEntity] = useState(null as unknown as SupportedTypes);
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);

    const { executeMultipleOperations } = useClassesContext();

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

    const ModifyEntityDialog = () => {
        const { language: preferredLanguage } = useConfigurationContext();
        const { sourceModelOfEntityMap, deleteEntityFromModel } = useClassesContext();
        const { models } = useModelGraphContext();

        const [name, setName] = useState(getNameLanguageString(modifiedEntity) ?? {});
        const [description, setDescription] = useState(getDescriptionLanguageString(modifiedEntity) ?? {});
        const [usageNote, setUsageNote] = useState<LanguageString>(
            isSemanticProfile(modifiedEntity) ? modifiedEntity.usageNote ?? {} : {}
        );

        const {
            attributes,
            attributeProfiles,
            canHaveAttributes,
            canHaveDomainAndRange,
            profileOf: directProfileOf,
            raw,
            specializationOfAsGeneralizations,
        } = EntityProxy(modifiedEntity);

        const isProfile = isSemanticProfile(modifiedEntity);

        const currentIri = getIri(modifiedEntity);
        const [newIri, setNewIri] = useState(currentIri ?? undefined);

        const currentDomainAndRange = canHaveDomainAndRange ? temporaryDomainRangeHelper(modifiedEntity) : null;

        const [newDomain, setNewDomain] = useState(
            currentDomainAndRange?.domain ?? ({} as SemanticModelRelationshipEnd)
        );
        const [newRange, setNewRange] = useState(currentDomainAndRange?.range ?? ({} as SemanticModelRelationshipEnd));

        const modelIri = useMemo(() => getModelIri(model), []);

        const [wantsToAddNewAttributes, setWantsToAddNewAttributes] = useState(false);
        const [newAttributes, setNewAttributes] = useState<Partial<Omit<SemanticModelRelationship, "type">>[]>([]);
        const [newAttributeProfiles, setNewAttributeProfiles] = useState<
            (Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">)[]
        >([]);
        const [toBeRemovedAttributes, setToBeRemovedAttributes] = useState<string[]>([]);

        const [newGeneralizations, setNewGeneralizations] = useState<
            Omit<SemanticModelGeneralization, "type" | "id">[]
        >([]);
        const [toBeRemovedSpecializations, setToBeRemovedSpecializations] = useState<string[]>([]);

        const getPossiblyOverriddenFields = () => {
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            if (!isProfile) {
                return getDefaultOverriddenFields();
            }
            if (!directProfileOf) {
                return getDefaultOverriddenFields();
            }

            let overriddenFields = {} as OverriddenFieldsType;

            overriddenFields = !areLanguageStringsEqual(name, getNameLanguageString(directProfileOf))
                ? { ...overriddenFields, name: true }
                : overriddenFields;
            overriddenFields = !areLanguageStringsEqual(description, getDescriptionLanguageString(directProfileOf))
                ? { ...overriddenFields, description: true }
                : overriddenFields;

            if (!isSemanticModelRelationshipUsage(modifiedEntity)) {
                return overriddenFields;
            }

            overriddenFields =
                (raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.domainIndex!)?.concept != null
                    ? { ...overriddenFields, domain: true }
                    : overriddenFields;
            overriddenFields =
                (raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.rangeIndex!)?.concept != null
                    ? { ...overriddenFields, range: true }
                    : overriddenFields;
            overriddenFields =
                (raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.domainIndex!)?.cardinality !=
                    null
                    ? { ...overriddenFields, domainCardinality: true }
                    : overriddenFields;
            overriddenFields =
                (raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.rangeIndex!)?.cardinality != null
                    ? { ...overriddenFields, rangeCardinality: true }
                    : overriddenFields;
            return overriddenFields;
        };

        const [changedFields, setChangedFields] = useState({
            name: false,
            description: false,
            iri: false,
            usageNote: false,
            domain: false,
            domainCardinality: false,
            range: false,
            rangeCardinality: false,
        });
        const [overriddenFields, setOverriddenFields] = useState(getPossiblyOverriddenFields());

        const changedFieldsAsStringArray = Object.entries(changedFields)
            .filter(([key, _]) => key != "name" && key != "description" && key != "iri" && key != "usageNote")
            .filter(([_, v]) => v == true)
            .map(([key, _]) => key);

        const getAdditionalOperationsToExecute = () => {
            const operations = [];
            if (isSemanticModelClass(modifiedEntity) || isSemanticModelClassUsage(modifiedEntity)) {
                for (const attribute of newAttributes) {
                    operations.push(createRelationship(attribute));
                }

                for (const attributeProfile of newAttributeProfiles) {
                    operations.push(createRelationshipUsage(attributeProfile));
                }
            }

            for (const gen of newGeneralizations) {
                operations.push(createGeneralization(gen));
            }

            // attributes and generalizations can be from different models, for such occasions they need to be removed from the model directly
            for (const rem of [...toBeRemovedAttributes, ...toBeRemovedSpecializations]) {
                const m = models.get(sourceModelOfEntityMap.get(rem) ?? "unknown-model-xyz");
                if (m instanceof InMemorySemanticModel && m.getId() != model?.getId()) {
                    deleteEntityFromModel(m, rem);
                } else {
                    operations.push(deleteEntity(rem));
                }
            }
            return operations;
        };

        const handleSaveClassOrClassProfile = (m: InMemorySemanticModel) => {
            const operations = [];

            if (isSemanticModelClass(modifiedEntity)) {
                let changedCls = {} as Partial<
                    Omit<SemanticModelClass & SemanticModelClassUsage, "type" | "usageOf" | "id">
                >;
                changedCls = changedFields.name ? { ...changedCls, name: name, iri: newIri } : changedCls;
                changedCls = changedFields.description ? { ...changedCls, description: description } : changedCls;
                changedCls = changedFields.iri ? { ...changedCls, iri: newIri } : changedCls;

                if (Object.entries(changedCls).length > 0) {
                    operations.push(modifyClass(modifiedEntity.id, changedCls));
                }
            } else {
                let changedCls = {} as Partial<Omit<SemanticModelClassUsage, "type" | "usageOf" | "id">>;
                if (overriddenFields.name && changedFields.name) {
                    changedCls = { ...changedCls, name: name, iri: newIri };
                }

                if (!overriddenFields.name && (raw as SemanticModelClassUsage).name != null) {
                    changedCls = { ...changedCls, name: null };
                }

                if (overriddenFields.description && changedFields.description) {
                    changedCls = { ...changedCls, description: description };
                }

                if (!overriddenFields.description && (raw as SemanticModelClassUsage).description != null) {
                    changedCls = { ...changedCls, description: null };
                }

                changedCls = changedFields.iri ? { ...changedCls, iri: newIri } : changedCls;

                changedCls = changedFields.usageNote ? { ...changedCls, usageNote: usageNote } : changedCls;

                if (Object.entries(changedCls).length > 0) {
                    operations.push(modifyClassUsage(modifiedEntity.id, changedCls));
                }
            }

            operations.push(...getAdditionalOperationsToExecute());

            executeMultipleOperations(m, operations);
        };

        const getDomainAndRangeEndChanges = () => {
            let domainEnd = {} as Partial<Omit<SemanticModelRelationshipEnd, "type" | "id">>;
            domainEnd = changedFields.domainCardinality
                ? { ...domainEnd, cardinality: newDomain.cardinality }
                : domainEnd;
            domainEnd = changedFields.domain ? { ...domainEnd, concept: newDomain.concept } : domainEnd;

            let rangeEnd = {} as Partial<Omit<SemanticModelRelationshipEnd, "type" | "id">>;
            rangeEnd = changedFields.name ? { ...rangeEnd, name: name } : rangeEnd;
            rangeEnd = changedFields.description ? { ...rangeEnd, description: description } : rangeEnd;
            rangeEnd = changedFields.iri ? { ...rangeEnd, iri: newIri } : rangeEnd;
            rangeEnd = changedFields.range ? { ...rangeEnd, concept: newRange.concept } : rangeEnd;
            rangeEnd = changedFields.rangeCardinality ? { ...rangeEnd, cardinality: newRange.cardinality } : rangeEnd;
            return { domainChanges: domainEnd, rangeChanges: rangeEnd };
        };

        const getDomainAndRangeEndChangesForProfile = () => {
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            let domainEnd = {} as Partial<Omit<SemanticModelRelationshipEndUsage, "type" | "id">>;
            // Domain
            if (overriddenFields.domain && changedFields.domain) {
                domainEnd = { ...domainEnd, concept: newDomain.concept };
            }
            if (
                !overriddenFields.domain &&
                (raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.domainIndex!)?.concept != null
            ) {
                domainEnd = { ...domainEnd, concept: null };
            }
            // domain cardinality
            if (overriddenFields.domainCardinality && changedFields.domainCardinality) {
                domainEnd = { ...domainEnd, cardinality: newDomain.cardinality };
            }
            if (
                !overriddenFields.domainCardinality &&
                (raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.domainIndex!)?.cardinality !=
                null
            ) {
                domainEnd = { ...domainEnd, cardinality: null };
            }

            // Range
            // name
            let rangeEnd = {} as Partial<Omit<SemanticModelRelationshipEndUsage, "type" | "id">>;
            if (overriddenFields.name && changedFields.name) {
                rangeEnd = { ...rangeEnd, name: name, iri: newIri };
            }
            if (
                !overriddenFields.name &&
                (raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.rangeIndex!)?.name != null
            ) {
                rangeEnd = { ...rangeEnd, name: null };
            }

            // description
            if (overriddenFields.description && changedFields.description) {
                rangeEnd = { ...rangeEnd, description: description };
            }
            if (
                !overriddenFields.description &&
                (raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.rangeIndex!)?.description != null
            ) {
                rangeEnd = { ...rangeEnd, description: null };
            }

            // range
            if (overriddenFields.range && changedFields.range) {
                rangeEnd = { ...rangeEnd, concept: newRange.concept };
            }
            if (
                !overriddenFields.range &&
                (raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.rangeIndex!)?.concept != null
            ) {
                rangeEnd = { ...rangeEnd, concept: null };
            }
            // range cardinality
            if (overriddenFields.rangeCardinality && changedFields.rangeCardinality) {
                rangeEnd = { ...rangeEnd, cardinality: newRange.cardinality };
            }
            if (
                !overriddenFields.rangeCardinality &&
                (raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.rangeIndex!)?.cardinality != null
            ) {
                rangeEnd = { ...rangeEnd, cardinality: null };
            }

            return { domainChanges: domainEnd, rangeChanges: rangeEnd };
        };

        const handleSaveRelationship = (m: InMemorySemanticModel) => {
            const { domainChanges, rangeChanges } = getDomainAndRangeEndChanges();

            const domainEnd = {
                ...currentDomainAndRange!.domain,
                ...domainChanges,
            } as SemanticModelRelationshipEnd;
            const rangeEnd = {
                ...currentDomainAndRange!.range,
                ...rangeChanges,
            } as SemanticModelRelationshipEnd;

            // keep the same order of domain and range
            let ends: SemanticModelRelationshipEnd[];
            if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
                ends = [rangeEnd, domainEnd];
            } else {
                ends = [domainEnd, rangeEnd];
            }

            const operations = [];
            operations.push(modifyRelation(modifiedEntity.id, { ends }));
            operations.push(...getAdditionalOperationsToExecute());

            executeMultipleOperations(m, operations);
        };

        const handleSaveRelationshipProfile = (m: InMemorySemanticModel) => {
            const { domainChanges, rangeChanges } = getDomainAndRangeEndChangesForProfile();

            // copy only the changes (use what raw entity provided)
            const domainEnd = {
                ...(raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.domainIndex!),
                ...domainChanges,
            } as SemanticModelRelationshipEndUsage;
            const rangeEnd = {
                ...(raw as SemanticModelRelationshipUsage).ends.at(currentDomainAndRange!.rangeIndex!),
                ...rangeChanges,
            } as SemanticModelRelationshipEndUsage;

            // keep the same order of domain and range
            let ends: SemanticModelRelationshipEndUsage[];
            if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
                ends = [rangeEnd, domainEnd];
            } else {
                ends = [domainEnd, rangeEnd];
            }

            const operations = [];
            operations.push(
                modifyRelationshipUsage(modifiedEntity.id, {
                    usageNote: changedFields.usageNote ? usageNote : null,
                    ends,
                })
            );
            operations.push(...getAdditionalOperationsToExecute());

            executeMultipleOperations(m, operations);
        };

        const handleSaveButtonClicked = () => {
            console.log("save button clicked", name, newIri, description, newAttributes);
            if (!model) {
                alert("model is null");
                close();
                return;
            }

            if (isSemanticModelClass(modifiedEntity) || isSemanticModelClassUsage(modifiedEntity)) {
                handleSaveClassOrClassProfile(model);
            } else if (isSemanticModelRelationship(modifiedEntity)) {
                handleSaveRelationship(model);
            } else if (isSemanticModelRelationshipUsage(modifiedEntity)) {
                handleSaveRelationshipProfile(model);
            }

            close();
        };

        return (
            <BaseDialog heading={isProfile ? t("modify-entity-dialog.label-profile") : t("modify-entity-dialog.label-class") } >
                <div>
                    <DialogColoredModelHeader
                        activeModel={model}
                        style="grid grid-cols-1 px-1 md:grid-cols-[25%_75%] gap-y-3 bg-slate-100 md:pl-8 md:pr-16 md:pb-4 md:pt-2"
                    />
                    <div className="grid grid-cols-1 gap-y-3 bg-slate-100 px-1 md:grid-cols-[25%_75%] md:pl-8 md:pr-16">
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

                        <DialogDetailRow detailKey={t("modify-entity-dialog.id")}>{modifiedEntity.id}</DialogDetailRow>

                        {/*
                        ----------
                        Entity IRI
                        ----------
                        */}

                        <DialogDetailRow detailKey={t("modify-entity-dialog.iri")}>
                            <IriInput
                                name={name}
                                iriHasChanged={changedFields.iri}
                                newIri={newIri}
                                setNewIri={(i) => setNewIri(i)}
                                onChange={() => setChangedFields((prev) => ({ ...prev, iri: true }))}
                                baseIri={modelIri}
                            />
                        </DialogDetailRow>

                        {/*
                        ----------
                        Entity generalizations
                        ----------
                        */}

                        <DialogDetailRow detailKey={t("modify-entity-dialog.specialization-of")}>
                            <GeneralizationParentsComponent
                                modifiedEntityId={modifiedEntity.id}
                                modifiedEntityType={getEntityTypeString(modifiedEntity)}
                                currentParentsAsGeneralizations={specializationOfAsGeneralizations}
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

                        {canHaveAttributes && (
                            <>
                                <DialogDetailRow style="flex flex-col" detailKey={t("modify-entity-dialog.attributes")}>
                                    <>
                                        {attributes.map((v) => (
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
                                        {attributeProfiles.map((ap) => (
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

                        {canHaveDomainAndRange && (
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

                {canHaveAttributes && (
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

    return {
        isModifyEntityDialogOpen: isOpen,
        closeModifyEntityDialog: localClose,
        openModifyEntityDialog: localOpen,
        ModifyEntityDialog,
    };
};
