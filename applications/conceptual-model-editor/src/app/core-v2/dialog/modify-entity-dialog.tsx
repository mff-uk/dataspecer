import {
    type SemanticModelClass,
    LanguageString,
    SemanticModelRelationship,
    isSemanticModelRelationship,
    isSemanticModelClass,
    SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useClassesContext } from "../context/classes-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { MultiLanguageInputForLanguageString } from "../components/input/multi-language-input-4-language-string";
import { useBaseDialog } from "../components/base-dialog";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipEndUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useConfigurationContext } from "../context/configuration-context";
import { getIri, getModelIri } from "../util/iri-utils";
import { IriInput } from "../components/input/iri-input";
import { AddAttributesComponent } from "../components/dialog/attributes-component";
import { DomainRangeComponent } from "./domain-range-component";
import { createRelationship, deleteEntity, modifyClass } from "@dataspecer/core-v2/semantic-model/operations";
import { createRelationshipUsage, modifyClassUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
import { getDescriptionLanguageString, getNameLanguageString } from "../util/name-utils";
import { temporaryDomainRangeHelper } from "../util/relationship-utils";
import { ProfileModificationWarning } from "../features/warnings/profile-modification-warning";
import {
    RemovableAttributeProfileRow,
    RemovableAttributeRow,
} from "../components/dialog/modify/removable-attribute-row";
import { DialogColoredModelHeader } from "../components/dialog/dialog-colored-model-header";
import { DialogDetailRow2 } from "../components/dialog/dialog-detail-row";
import { MultiLanguageInputForLanguageStringWithOverride } from "../components/input/multi-language-input-4-language-string-with-override";
import {
    NewRemovableAttributeProfileRow,
    NewRemovableAttributeRow,
} from "../components/dialog/modify/new-attribute-row";
import { isSemanticProfile } from "../util/profile-utils";
import { EntityProxy } from "../util/detail-utils";
import { CancelButton } from "../components/dialog/buttons/cancel-button";
import { ModifyButton } from "../components/dialog/buttons/modify-button";

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

        const { modifyRelationship, updateEntityUsage } = useModelGraphContext();

        const currentIri = getIri(modifiedEntity);

        const [name2, setName2] = useState(getNameLanguageString(modifiedEntity) ?? {});
        const [description2, setDescription2] = useState(getDescriptionLanguageString(modifiedEntity) ?? {});
        const [usageNote2, setUsageNote2] = useState<LanguageString>(
            isSemanticProfile(modifiedEntity) ? modifiedEntity.usageNote ?? {} : {}
        );

        const { attributes, attributeProfiles, canHaveAttributes, canHaveDomainAndRange } = EntityProxy(modifiedEntity);

        const isProfile = isSemanticProfile(modifiedEntity);

        const [newIri, setNewIri] = useState(currentIri ?? undefined);
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

        const currentDomainAndRange = canHaveDomainAndRange ? temporaryDomainRangeHelper(modifiedEntity) : null;

        const [newDomain, setNewDomain] = useState(
            currentDomainAndRange?.domain ?? ({} as SemanticModelRelationshipEnd)
        );
        const [newRange, setNewRange] = useState(currentDomainAndRange?.range ?? ({} as SemanticModelRelationshipEnd));

        const modelIri = getModelIri(model);

        const [wantsToAddNewAttributes, setWantsToAddNewAttributes] = useState(false);
        const [newAttributes, setNewAttributes] = useState<Partial<Omit<SemanticModelRelationship, "type">>[]>([]);
        const [newAttributeProfiles, setNewAttributeProfiles] = useState<
            (Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">)[]
        >([]);
        const [toBeRemovedAttributes, setToBeRemovedAttributes] = useState<string[]>([]);

        const changedFieldsAsStringArray = Object.entries(changedFields)
            .filter(([key, _]) => key != "name" && key != "description" && key != "iri" && key != "usageNote")
            .filter(([_, v]) => v == true)
            .map(([key, _]) => key);

        const handleSaveClassOrClassProfile = (m: InMemorySemanticModel) => {
            // TODO: something broken with attribute profiles
            const operations = [];
            let changedCls = {} as Partial<
                Omit<SemanticModelClass & SemanticModelClassUsage, "type" | "usageOf" | "id">
            >;
            changedCls = changedFields.name ? { ...changedCls, name: name2, iri: newIri } : changedCls;
            changedCls = changedFields.description ? { ...changedCls, description: description2 } : changedCls;
            changedCls = changedFields.iri ? { ...changedCls, iri: newIri } : changedCls;

            if (isSemanticModelClass(modifiedEntity) && Object.entries(changedCls).length > 0) {
                operations.push(modifyClass(modifiedEntity.id, changedCls));
            } else {
                changedCls = changedFields.usageNote ? { ...changedCls, usageNote: usageNote2 } : changedCls;

                if (Object.entries(changedCls).length > 0) {
                    operations.push(modifyClassUsage(modifiedEntity.id, changedCls));
                }
            }

            for (const attribute of newAttributes) {
                operations.push(createRelationship(attribute));
            }

            for (const attributeProfile of newAttributeProfiles) {
                operations.push(createRelationshipUsage(attributeProfile));
            }

            for (const rem of toBeRemovedAttributes) {
                operations.push(deleteEntity(rem));
                console.log("todo remove entity from attribute's domain", rem);
            }
            executeMultipleOperations(m, operations);
        };

        const getDomainAndRangeEndChanges = () => {
            let de = {} as Partial<
                Omit<SemanticModelRelationshipEnd & SemanticModelRelationshipEndUsage, "type" | "id">
            >;
            de = changedFields.domainCardinality ? { ...de, cardinality: newDomain.cardinality } : de;
            de = changedFields.domain ? { ...de, concept: newDomain.concept } : de;

            let re = {} as Partial<
                Omit<SemanticModelRelationshipEnd & SemanticModelRelationshipEndUsage, "type" | "id">
            >;
            re = changedFields.name ? { ...re, name: name2 } : re;
            re = changedFields.description ? { ...re, description: description2 } : re;
            re = changedFields.iri ? { ...re, iri: newIri } : re;
            re = changedFields.range ? { ...re, concept: newRange.concept } : re;
            re = changedFields.rangeCardinality ? { ...re, cardinality: newRange.cardinality } : re;
            return { domainChanges: de, rangeChanges: re };
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

            let ends: SemanticModelRelationshipEnd[];
            if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
                ends = [rangeEnd, domainEnd];
            } else {
                ends = [domainEnd, rangeEnd];
            }

            const result = modifyRelationship(m, modifiedEntity.id, {
                ends,
            });
            console.log("modifying relationship: ", modifiedEntity.id, ends);
            return result;
        };

        const handleSaveRelationshipProfile = (m: InMemorySemanticModel) => {
            const { domainChanges, rangeChanges } = getDomainAndRangeEndChanges();

            const domainEnd = {
                ...currentDomainAndRange?.domain,
                ...domainChanges,
            } as SemanticModelRelationshipEndUsage;
            const rangeEnd = {
                ...currentDomainAndRange?.range,
                ...rangeChanges,
            } as SemanticModelRelationshipEndUsage;

            let ends: SemanticModelRelationshipEndUsage[];
            if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
                ends = [rangeEnd, domainEnd];
            } else {
                ends = [domainEnd, rangeEnd];
            }

            const res = updateEntityUsage(m, "relationship-usage", modifiedEntity.id, {
                usageNote: changedFields.usageNote ? usageNote2 : null,
                ends,
            });
            console.log(
                res,
                "relationship profile updated",
                ends,
                usageNote2,
                description2,
                name2,
                newRange,
                newDomain
            );
        };

        const handleSaveButtonClicked = () => {
            console.log("save button clicked", name2, newIri, description2, newAttributes);
            if (!model) {
                alert(`model is null`);
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
            <BaseDialog heading="Entity modification">
                <div>
                    <DialogColoredModelHeader
                        activeModel={model}
                        style="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pl-8 pr-16 pb-4 pt-2"
                    />
                    <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pl-8 pr-16">
                        <DialogDetailRow2 detailKey="name">
                            <MultiLanguageInputForLanguageStringWithOverride
                                style="text-xl"
                                forElement="modify-entity-name"
                                inputType="text"
                                ls={name2}
                                setLs={setName2}
                                defaultLang={preferredLanguage}
                                disabled={isProfile && !changedFields.name}
                                onChange={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                                withOverride={isProfile}
                            />
                        </DialogDetailRow2>

                        {/* 
                        ---------
                        Entity id
                        ---------
                        */}

                        <DialogDetailRow2 detailKey="id">{modifiedEntity.id}</DialogDetailRow2>

                        {/* 
                        ----------
                        Entity IRI
                        ----------
                        */}

                        <DialogDetailRow2 detailKey="iri">
                            <IriInput
                                name={name2}
                                iriHasChanged={changedFields.iri}
                                newIri={newIri}
                                setNewIri={(i) => setNewIri(i)}
                                onChange={() => setChangedFields((prev) => ({ ...prev, iri: true }))}
                                baseIri={modelIri}
                            />
                        </DialogDetailRow2>

                        {/* 
                        ------------------
                        Entity description
                        ------------------
                        */}

                        <DialogDetailRow2 detailKey="description">
                            <MultiLanguageInputForLanguageStringWithOverride
                                forElement="modify-entity-description"
                                inputType="textarea"
                                ls={description2}
                                setLs={setDescription2}
                                defaultLang={preferredLanguage}
                                disabled={isProfile && !changedFields.description}
                                onChange={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                                withOverride={isProfile}
                            />
                        </DialogDetailRow2>

                        {isProfile && (
                            <DialogDetailRow2 detailKey="usage (profile?) note">
                                <MultiLanguageInputForLanguageString
                                    inputType="text"
                                    ls={usageNote2}
                                    setLs={setUsageNote2}
                                    defaultLang={preferredLanguage}
                                    onChange={() => setChangedFields((prev) => ({ ...prev, usageNote: true }))}
                                />
                            </DialogDetailRow2>
                        )}

                        {/* 
                        --------------------------------------
                        Attributes for class and class profile
                        --------------------------------------
                        */}

                        {canHaveAttributes && (
                            <>
                                <DialogDetailRow2 style="flex flex-col" detailKey="attributes">
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
                                        {newAttributes.map((a) => (
                                            <NewRemovableAttributeRow
                                                attribute={a}
                                                deleteButtonClicked={() => {
                                                    setNewAttributes((prev) => prev.filter((v1) => v1 != a));
                                                }}
                                            />
                                        ))}
                                    </>
                                </DialogDetailRow2>
                                <DialogDetailRow2 style="flex flex-col" detailKey="attributes profiles">
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

                                        {newAttributeProfiles.map((ap) => (
                                            <NewRemovableAttributeProfileRow
                                                resource={ap}
                                                deleteButtonClicked={() =>
                                                    setNewAttributeProfiles((prev) => prev.filter((v1) => v1 != ap))
                                                }
                                            />
                                        ))}
                                    </>
                                </DialogDetailRow2>
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
                                        <DialogDetailRow2 detailKey="warning">
                                            <ProfileModificationWarning changedFields={changedFieldsAsStringArray} />
                                        </DialogDetailRow2>
                                    </>
                                )}
                                <DomainRangeComponent
                                    enabledFields={changedFields}
                                    withOverride={isProfile}
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
                Adding new attributes to class or TODO: class profile
                -----------------------------------------------------
                */}

                {canHaveAttributes && (
                    <p className="bg-slate-100">
                        <div className="flex flex-row justify-between">
                            <button
                                className="ml-8 bg-slate-300"
                                onClick={() => setWantsToAddNewAttributes((prev) => !prev)}
                            >
                                {wantsToAddNewAttributes ? "cancel" : "add attribute"}
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
                                    saveNewAttributeProfile={(
                                        attributeProfile: Partial<Omit<SemanticModelRelationshipUsage, "type">> &
                                            Pick<SemanticModelRelationshipUsage, "usageOf">
                                    ) => {
                                        setNewAttributeProfiles((prev) => prev.concat(attributeProfile));
                                        setWantsToAddNewAttributes(false);
                                    }}
                                />
                            )}
                        </div>
                    </p>
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
                        style=" hover:disabled:cursor-not-allowed"
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
