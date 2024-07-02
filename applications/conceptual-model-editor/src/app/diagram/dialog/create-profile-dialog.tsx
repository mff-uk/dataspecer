import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useBaseDialog } from "../components/base-dialog";
import { filterInMemoryModels } from "../util/model-utils";
import { MultiLanguageInputForLanguageString } from "../components/input/multi-language-input-4-language-string";
import {
    type LanguageString,
    type SemanticModelClass,
    type SemanticModelRelationship,
    type SemanticModelRelationshipEnd,
    isSemanticModelClass,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipEndUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useConfigurationContext } from "../context/configuration-context";
import { DomainRangeComponent } from "./domain-range-component";
import { getDescriptionLanguageString, getNameLanguageString } from "../util/name-utils";
import { temporaryDomainRangeHelper } from "../util/relationship-utils";
import { ProfileModificationWarning } from "../features/warnings/profile-modification-warning";
import { DialogDetailRow } from "../components/dialog/dialog-detail-row";
import { EntityProxy, getEntityTypeString } from "../util/detail-utils";
import { MultiLanguageInputForLanguageStringWithOverride } from "../components/input/multi-language-input-4-language-string-with-override";
import type { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { DialogColoredModelHeaderWithModelSelector } from "../components/dialog/dialog-colored-model-header";
import { getIri, getModelIri } from "../util/iri-utils";
import { getRandomName } from "~/app/utils/random-gen";
import { IriInput } from "../components/input/iri-input";
import { CancelButton } from "../components/dialog/buttons/cancel-button";
import { CreateButton } from "../components/dialog/buttons/create-button";
import { useClassesContext } from "../context/classes-context";
import { type OverriddenFieldsType, getDefaultOverriddenFields } from "../util/profile-utils";
import { t } from "../application/";

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

        // --- relationships and relationship profiles --- --- ---
        const hasDomainAndRange = isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity);
        const currentDomainAndRange =
            isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)
                ? temporaryDomainRangeHelper(entity)
                : null;

        const [newDomain, setNewDomain] = useState(
            currentDomainAndRange?.domain ?? ({} as SemanticModelRelationshipEnd)
        );
        const [newRange, setNewRange] = useState(currentDomainAndRange?.range ?? ({} as SemanticModelRelationshipEnd));

        // --- model it comes from --- --- ---

        const model = inMemoryModels.find((m) => m.getId() == activeModel);
        const modelIri = getModelIri(model);

        // --- profiling --- --- ---

        const displayNameOfProfiledEntity = entity ? EntityProxy(entity, preferredLanguage).name : null;

        const changedFieldsAsStringArray = Object.entries(changedFields)
            .filter(([key, _]) => key != "name" && key != "description")
            .filter(([_, v]) => v == true)
            .map(([key, _]) => key);

        if (inMemoryModels.length == 0) {
            alert("Create a local model first, please");
            localClose();
            return;
        }

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
                heading={t("create-profile-dialog.label", displayNameOfProfiledEntity)}
            >
                <div>
                    <DialogColoredModelHeaderWithModelSelector
                        style="grid grid-cols-1 px-1 md:grid-cols-[25%_75%] gap-y-3 bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
                        activeModel={activeModel}
                        onModelSelected={(m) => setActiveModel(m)}
                    />
                    <div className="grid grid-cols-1 gap-y-3 bg-slate-100 px-1 md:grid-cols-[25%_75%] md:pb-4 md:pl-8 md:pr-16 md:pt-2">
                        <DialogDetailRow detailKey={t("create-profile-dialog.profiled")}>{displayNameOfProfiledEntity}</DialogDetailRow>
                        <DialogDetailRow detailKey={t("create-profile-dialog.profiled-type")}>
                            {getEntityTypeString(entity)}
                        </DialogDetailRow>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-y-3 bg-slate-100 px-1 md:grid-cols-[25%_75%] md:pb-4 md:pl-8 md:pr-16 md:pt-2">

                    <DialogDetailRow detailKey={t("create-profile-dialog.name")}>
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
                    </DialogDetailRow>

                    <DialogDetailRow detailKey={t("create-profile-dialog.iri")}>
                        <IriInput
                            name={name}
                            newIri={newIri}
                            setNewIri={(i) => setNewIri(i)}
                            iriHasChanged={changedFields.iri}
                            onChange={() => setChangedFields((prev) => ({ ...prev, iri: true }))}
                            baseIri={modelIri}
                        />
                    </DialogDetailRow>

                    <DialogDetailRow detailKey={t("create-profile-dialog.description")}>
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
                    </DialogDetailRow>

                    <DialogDetailRow detailKey={t("create-profile-dialog.usage-note")}>
                        <MultiLanguageInputForLanguageString
                            ls={usageNote}
                            setLs={setUsageNote}
                            defaultLang={preferredLanguage}
                            inputType="textarea"
                        />
                    </DialogDetailRow>

                    {hasDomainAndRange && (
                        <>
                            {changedFieldsAsStringArray.length > 0 && (
                                <>
                                    <DialogDetailRow detailKey="warning">
                                        <ProfileModificationWarning changedFields={changedFieldsAsStringArray} />
                                    </DialogDetailRow>
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
                        <CreateButton style="cursor-not-allowed" disabled={true} title="You have to select model first" />
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
