import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useBaseDialog } from "../components/base-dialog";
import { filterInMemoryModels } from "../util/utils";
import { MultiLanguageInputForLanguageString } from "../components/input/multi-language-input-4-language-string";
import {
    LanguageString,
    SemanticModelClass,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelClass,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipEndUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useConfigurationContext } from "../context/configuration-context";
import { DomainRangeComponent } from "./domain-range-component";
import { getDescriptionLanguageString, getNameLanguageString } from "../util/name-utils";
import { temporaryDomainRangeHelper } from "../util/relationship-utils";
import { ProfileModificationWarning } from "../features/warnings/profile-modification-warning";
import { DialogDetailRow } from "../components/dialog-detail-row";
import { EntityProxy, getEntityTypeString } from "../util/detail-utils";
import { MultiLanguageInputForLanguageStringWithOverride } from "../components/input/multi-language-input-4-language-string-with-override";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { DialogColoredModelHeaderWithModelSelector } from "../components/dialog-colored-model-header";

export type ProfileDialogSupportedTypes =
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassUsage
    | SemanticModelRelationshipUsage;

export const useCreateProfileDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [entity, setEntity] = useState<ProfileDialogSupportedTypes | null>(null);

    const localOpen = (entity: ProfileDialogSupportedTypes) => {
        setEntity(entity);
        open();
    };

    const localClose = () => {
        setEntity(null);
        close();
    };

    const CreateProfileDialog = () => {
        const { language: preferredLanguage } = useConfigurationContext();

        const { models, createClassEntityUsage, createRelationshipEntityUsage, aggregatorView } =
            useModelGraphContext();
        const inMemoryModels = filterInMemoryModels([...models.values()]);

        if (inMemoryModels.length == 0) {
            alert("Create a local model first, please");
            localClose();
            return;
        }

        const [usageNote, setUsageNote] = useState<LanguageString>({});
        const [name, setName] = useState<LanguageString>(getNameLanguageString(entity) ?? {});
        const [description, setDescription] = useState<LanguageString>(getDescriptionLanguageString(entity) ?? {});
        const [activeModel, setActiveModel] = useState(inMemoryModels.at(0)?.getId() ?? "---");
        const [changedFields, setChangedFields] = useState({
            name: false,
            description: false,
            domain: false,
            domainCardinality: false,
            range: false,
            rangeCardinality: false,
        });

        // Relationships and relationship profiles
        const currentDomainAndRange =
            isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)
                ? temporaryDomainRangeHelper(entity)
                : null;

        const [newDomain, setNewDomain] = useState(
            currentDomainAndRange?.domain ?? ({} as SemanticModelRelationshipEnd)
        );
        const [newRange, setNewRange] = useState(currentDomainAndRange?.range ?? ({} as SemanticModelRelationshipEnd));

        const model = inMemoryModels.find((m) => m.getId() == activeModel);

        const displayNameOfProfiledEntity = entity ? EntityProxy(entity, preferredLanguage).name : null;

        const hasDomainAndRange = isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity);

        const changedFieldsAsStringArray = Object.entries(changedFields)
            .filter(([key, _]) => key != "name" && key != "description")
            .filter(([_, v]) => v == true)
            .map(([key, _]) => key);

        const handleSaveClassProfile = (e: SemanticModelClass | SemanticModelClassUsage, m: InMemorySemanticModel) => {
            const { id: classUsageId } = createClassEntityUsage(m, e.type[0], {
                usageOf: e.id,
                usageNote: usageNote,
                description: changedFields.description ? description : null,
                name: changedFields.name ? name : null,
            });

            if (classUsageId) {
                aggregatorView.getActiveVisualModel()?.addEntity({ sourceEntityId: classUsageId });
            }
        };

        const handleSaveRelationshipProfile = (
            e: SemanticModelRelationship | SemanticModelRelationshipUsage,
            m: InMemorySemanticModel
        ) => {
            const domainEnd = {
                concept: changedFields.domain ? newDomain.concept : null,
                name: null,
                description: null,
                cardinality: changedFields.domainCardinality ? newDomain.cardinality ?? null : null,
                usageNote: null,
            } satisfies SemanticModelRelationshipEndUsage;
            const rangeEnd = {
                concept: changedFields.range ? newRange.concept : null,
                name: changedFields.name ? name : null,
                description: changedFields.description ? description : null,
                cardinality: changedFields.rangeCardinality ? newRange.cardinality ?? null : null,
                usageNote: null,
            } as SemanticModelRelationshipEndUsage;

            let ends: SemanticModelRelationshipEndUsage[];
            if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
                ends = [rangeEnd, domainEnd];
            } else {
                ends = [domainEnd, rangeEnd];
            }

            createRelationshipEntityUsage(m, e.type[0], {
                usageOf: e.id,
                usageNote: usageNote,
                ends: ends,
            });
        };

        const handleSavingProfile = (m: InMemorySemanticModel) => {
            console.log("saving profile", changedFields, name, description, usageNote, newDomain, newRange);

            if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
                handleSaveClassProfile(entity, m);
            } else if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) {
                handleSaveRelationshipProfile(entity, m);
            }
            localClose();
        };

        return (
            <BaseDialog
                heading={`Create a profile ${displayNameOfProfiledEntity ? "of " + displayNameOfProfiledEntity : ""}`}
            >
                <div>
                    <DialogColoredModelHeaderWithModelSelector
                        style="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pb-4 pl-8 pr-16 pt-2"
                        activeModel={activeModel}
                        onModelSelected={(m) => setActiveModel(m)}
                    />
                    <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pb-4 pl-8 pr-16 pt-2">
                        <DialogDetailRow detailKey="profiled entity" detailValue={displayNameOfProfiledEntity} />
                        <DialogDetailRow detailKey="profiled entity type" detailValue={getEntityTypeString(entity)} />
                    </div>
                </div>
                <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pb-4 pl-8 pr-16 pt-2">
                    {/* 
                    ------------
                    Profile name
                    ------------
                    */}

                    <DialogDetailRow
                        detailKey="name"
                        detailValue={
                            <MultiLanguageInputForLanguageStringWithOverride
                                forElement="create-profile-name"
                                ls={name}
                                setLs={setName}
                                defaultLang={preferredLanguage}
                                inputType="text"
                                withOverride={true}
                                disabled={!changedFields.name}
                                onChange={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                            />
                        }
                    />

                    {/* 
                    -------------------
                    Profile description
                    -------------------
                    */}

                    <DialogDetailRow
                        detailKey="description"
                        detailValue={
                            <MultiLanguageInputForLanguageStringWithOverride
                                forElement="create-profile-description"
                                ls={description}
                                setLs={setDescription}
                                defaultLang={preferredLanguage}
                                inputType="textarea"
                                withOverride={true}
                                disabled={!changedFields.description}
                                onChange={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                            />
                        }
                    />

                    {/* 
                    ----------
                    Usage note
                    ----------
                    */}

                    <DialogDetailRow
                        detailKey="usage (profile?) note"
                        detailValue={
                            <MultiLanguageInputForLanguageString
                                ls={usageNote}
                                setLs={setUsageNote}
                                defaultLang={preferredLanguage}
                                inputType="textarea"
                            />
                        }
                    />

                    {/* 
                    -----------------------------------------------------------
                    Range and domain for a relationship or relationship profile
                    -----------------------------------------------------------
                    */}
                    {hasDomainAndRange && (
                        <>
                            {changedFieldsAsStringArray.length > 0 && (
                                <>
                                    <DialogDetailRow
                                        detailKey="warning"
                                        detailValue={
                                            <ProfileModificationWarning changedFields={changedFieldsAsStringArray} />
                                        }
                                    />
                                </>
                            )}
                            <DomainRangeComponent
                                enabledFields={changedFields}
                                withCheckEnabling={true}
                                entity={entity}
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
                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    {model && entity ? (
                        <button onClick={() => handleSavingProfile(model)}>save</button>
                    ) : (
                        <button disabled title="model probably not selected" className="cursor-not-allowed">
                            save
                        </button>
                    )}
                    <button onClick={localClose}>close</button>
                </div>
            </BaseDialog>
        );
    };

    return {
        isCreateProfileDialogOpen: isOpen,
        closeCreateProfileDialog: close,
        openCreateProfileDialog: localOpen,
        CreateProfileDialog,
    };
};
