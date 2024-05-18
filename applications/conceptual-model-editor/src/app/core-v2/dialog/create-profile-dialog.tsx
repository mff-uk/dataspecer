import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useBaseDialog } from "../components/base-dialog";
import { filterInMemoryModels } from "../util/model-utils";
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
import { DialogDetailRow2 } from "../components/dialog/dialog-detail-row";
import { EntityProxy, getEntityTypeString } from "../util/detail-utils";
import { MultiLanguageInputForLanguageStringWithOverride } from "../components/input/multi-language-input-4-language-string-with-override";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { DialogColoredModelHeaderWithModelSelector } from "../components/dialog/dialog-colored-model-header";
import { getIri, getModelIri } from "../util/iri-utils";
import { getRandomName } from "~/app/utils/random-gen";
import { IriInput } from "../components/input/iri-input";
import { CancelButton } from "../components/dialog/buttons/cancel-button";
import { CreateButton } from "../components/dialog/buttons/create-button";
import { useClassesContext } from "../context/classes-context";
import { OverriddenFieldsType, getDefaultOverriddenFields } from "../util/profile-utils";

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
        const { createClassEntityUsage, createRelationshipEntityUsage } = useClassesContext();
        const { models, aggregatorView } = useModelGraphContext();
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
        const [newIri, setNewIri] = useState(getIri(entity)?.concat("-profile") ?? getRandomName(8));
        const [changedFields, setChangedFields] = useState({
            name: false,
            description: false,
            iri: false,
            domain: false,
            domainCardinality: false,
            range: false,
            rangeCardinality: false,
        });

        const [overriddenFields, setOverriddenFields] = useState<OverriddenFieldsType>(getDefaultOverriddenFields());

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
        const modelIri = getModelIri(model);

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
                description: overriddenFields.description && changedFields.description ? description : null,
                name: overriddenFields.name && changedFields.name ? name : null,
                iri: newIri,
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
                concept: overriddenFields.domain && changedFields.domain ? newDomain.concept : null,
                name: null,
                description: null,
                cardinality:
                    overriddenFields.domainCardinality && changedFields.domainCardinality
                        ? newDomain.cardinality ?? null
                        : null,
                usageNote: null,
                iri: null,
            } satisfies SemanticModelRelationshipEndUsage;
            const rangeEnd = {
                concept: overriddenFields.range && changedFields.range ? newRange.concept : null,
                name: overriddenFields.name && changedFields.name ? name : null,
                description: overriddenFields.description && changedFields.description ? description : null,
                cardinality:
                    overriddenFields.rangeCardinality && changedFields.rangeCardinality
                        ? newRange.cardinality ?? null
                        : null,
                usageNote: null,
                iri: newIri,
            } as SemanticModelRelationshipEndUsage;

            let ends: SemanticModelRelationshipEndUsage[];
            if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
                ends = [rangeEnd, domainEnd];
            } else {
                ends = [domainEnd, rangeEnd];
            }

            const { id: relationshipUsageId } = createRelationshipEntityUsage(m, e.type[0], {
                usageOf: e.id,
                usageNote: usageNote,
                ends: ends,
            });

            if (relationshipUsageId) {
                aggregatorView.getActiveVisualModel()?.addEntity({ sourceEntityId: relationshipUsageId });
            }
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
                        <DialogDetailRow2 detailKey="profiled entity">{displayNameOfProfiledEntity}</DialogDetailRow2>
                        <DialogDetailRow2 detailKey="profiled entity type">
                            {getEntityTypeString(entity)}
                        </DialogDetailRow2>
                    </div>
                </div>
                <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pb-4 pl-8 pr-16 pt-2">
                    {/* 
                    ------------
                    Profile name
                    ------------
                    */}

                    <DialogDetailRow2 detailKey="name">
                        <MultiLanguageInputForLanguageStringWithOverride
                            forElement="create-profile-name"
                            ls={name}
                            setLs={setName}
                            defaultLang={preferredLanguage}
                            inputType="text"
                            withOverride={{
                                callback: () => setOverriddenFields((prev) => ({ ...prev, name: !prev.name })),
                                defaultValue: false,
                            }}
                            disabled={!overriddenFields.name}
                            onChange={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                        />
                    </DialogDetailRow2>

                    {/* 
                    -----------
                    Profile IRI
                    -----------
                    */}

                    <DialogDetailRow2 detailKey="iri">
                        <IriInput
                            name={name}
                            newIri={newIri}
                            setNewIri={(i) => setNewIri(i)}
                            iriHasChanged={changedFields.iri}
                            onChange={() => setChangedFields((prev) => ({ ...prev, iri: true }))}
                            baseIri={modelIri}
                            withNameSuggestionsDisabled={true}
                        />
                    </DialogDetailRow2>

                    {/* 
                    -------------------
                    Profile description
                    -------------------
                    */}

                    <DialogDetailRow2 detailKey="description">
                        <MultiLanguageInputForLanguageStringWithOverride
                            forElement="create-profile-description"
                            ls={description}
                            setLs={setDescription}
                            defaultLang={preferredLanguage}
                            inputType="textarea"
                            withOverride={{
                                callback: () =>
                                    setOverriddenFields((prev) => ({ ...prev, description: !prev.description })),
                                defaultValue: false,
                            }}
                            disabled={!overriddenFields.description}
                            onChange={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                        />
                    </DialogDetailRow2>

                    {/* 
                    ----------
                    Usage note
                    ----------
                    */}

                    <DialogDetailRow2 detailKey="usage (profile?) note">
                        <MultiLanguageInputForLanguageString
                            ls={usageNote}
                            setLs={setUsageNote}
                            defaultLang={preferredLanguage}
                            inputType="textarea"
                        />
                    </DialogDetailRow2>

                    {/* 
                    -----------------------------------------------------------
                    Range and domain for a relationship or relationship profile
                    -----------------------------------------------------------
                    */}
                    {hasDomainAndRange && (
                        <>
                            {changedFieldsAsStringArray.length > 0 && (
                                <>
                                    <DialogDetailRow2 detailKey="warning">
                                        <ProfileModificationWarning changedFields={changedFieldsAsStringArray} />
                                    </DialogDetailRow2>
                                </>
                            )}
                            <DomainRangeComponent
                                entity={entity}
                                domain={newDomain}
                                setDomain={setNewDomain}
                                onDomainChange={() => setChangedFields((prev) => ({ ...prev, domain: true }))}
                                onDomainCardinalityChange={() =>
                                    setChangedFields((prev) => ({ ...prev, domainCardinality: true }))
                                }
                                range={newRange}
                                setRange={setNewRange}
                                onRangeChange={() => setChangedFields((prev) => ({ ...prev, range: true }))}
                                onRangeCardinalityChange={() =>
                                    setChangedFields((prev) => ({ ...prev, rangeCardinality: true }))
                                }
                                withOverride={{ overriddenFields, setOverriddenFields }}
                            />
                        </>
                    )}
                </div>
                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    {model && entity ? (
                        <CreateButton onClick={() => handleSavingProfile(model)} />
                    ) : (
                        <CreateButton style="cursor-not-allowed" disabled={true} title="model probably not selected" />
                    )}
                    <CancelButton onClick={localClose} />
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
