import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useBaseDialog } from "./base-dialog";
import { filterInMemoryModels } from "../util/utils";
import { MultiLanguageInputForLanguageString } from "./multi-language-input-4-language-string";
import {
    LanguageString,
    SemanticModelClass,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
    isSemanticModelClass,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { getLocalizedStringFromLanguageString } from "../util/language-utils";
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
import { getIri } from "../util/model-utils";
import { temporaryDomainRangeHelper } from "../util/relationship-utils";
import { OverrideFieldCheckbox } from "./override-field-checkbox";
import { ProfileModificationWarning } from "./profile-modification-warning";

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

        const nameOfProfiledEntity =
            getLocalizedStringFromLanguageString(getNameLanguageString(entity), preferredLanguage) ?? entity?.id;

        if (inMemoryModels.length == 0) {
            alert("Create a local model first, please");
            localClose();
            return;
        }
        console.log(model, entity, currentDomainAndRange);
        return (
            <BaseDialog heading={`Create a profile ${nameOfProfiledEntity ? "of " + nameOfProfiledEntity : ""}`}>
                <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pl-8 pr-16">
                    <div className="font-semibold">active model:</div>
                    <select name="models" id="models" onChange={(e) => setActiveModel(e.target.value)}>
                        {inMemoryModels
                            .map((m) => ({ mId: m.getId(), mAlias: m.getAlias() }))
                            .map(({ mId, mAlias }) => (
                                <option value={mId}>
                                    {mAlias ? mAlias + ":" : null}
                                    {mId}
                                </option>
                            ))}
                    </select>
                    <div className="font-semibold">profiled entity:</div>
                    <div>
                        {nameOfProfiledEntity}, {getIri(entity) ?? entity?.id}
                    </div>
                    <div className="font-semibold">profiled entity type:</div>
                    <div>
                        {entity?.type +
                            ((isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) &&
                            isSemanticModelAttribute(entity)
                                ? " (attribute)"
                                : "")}
                    </div>

                    {/* 
                    ------------
                    Profile name
                    ------------
                    */}

                    <div className="font-semibold">name:</div>
                    <div className="flex flex-row">
                        <div className="flex-grow">
                            <MultiLanguageInputForLanguageString
                                ls={name}
                                setLs={setName}
                                defaultLang={preferredLanguage}
                                inputType="text"
                                disabled={!changedFields.name}
                            />
                        </div>
                        <div className="ml-2">
                            <OverrideFieldCheckbox
                                forElement="create-profile-name"
                                disabled={changedFields.name}
                                onChecked={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                            />
                        </div>
                    </div>

                    {/* 
                    -------------------
                    Profile description
                    -------------------
                    */}

                    <div className="font-semibold">description:</div>
                    <div className="flex flex-row">
                        <div className="flex-grow">
                            <MultiLanguageInputForLanguageString
                                ls={description}
                                setLs={setDescription}
                                defaultLang={preferredLanguage}
                                inputType="textarea"
                                disabled={!changedFields.description}
                            />
                        </div>
                        <div className="ml-2">
                            <OverrideFieldCheckbox
                                forElement="create-profile-description"
                                disabled={changedFields.description}
                                onChecked={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                            />
                        </div>
                    </div>

                    {/* 
                    ----------
                    Usage note
                    ----------
                    */}

                    <div className="font-semibold">usage (profile?) note:</div>
                    <div>
                        <MultiLanguageInputForLanguageString
                            ls={usageNote}
                            setLs={setUsageNote}
                            defaultLang={preferredLanguage}
                            inputType="textarea"
                        />
                    </div>

                    {/* 
                    -----------------------------------------------------------
                    Range and domain for a relationship or relationship profile
                    -----------------------------------------------------------
                    */}
                    {(isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) && (
                        <>
                            {(changedFields.domain ||
                                changedFields.range ||
                                changedFields.domainCardinality ||
                                changedFields.rangeCardinality) && (
                                <>
                                    <div />
                                    <ProfileModificationWarning
                                        changedFields={([] as string[])
                                            .concat(changedFields.domain ? "domain" : "")
                                            .concat(changedFields.range ? "range" : "")
                                            .concat(changedFields.domainCardinality ? "domain cardinality" : "")
                                            .concat(changedFields.rangeCardinality ? "range cardinality" : "")
                                            .filter((s) => s.length > 0)}
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
                        <button
                            onClick={() => {
                                if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
                                    const { id: classUsageId } = createClassEntityUsage(model, entity.type[0], {
                                        usageOf: entity.id,
                                        usageNote: usageNote,
                                        description: changedFields.description ? description : null,
                                        name: changedFields.name ? name : null,
                                    });

                                    if (classUsageId) {
                                        aggregatorView
                                            .getActiveVisualModel()
                                            ?.addEntity({ sourceEntityId: classUsageId });
                                    }
                                } else if (
                                    isSemanticModelRelationship(entity) ||
                                    isSemanticModelRelationshipUsage(entity)
                                ) {
                                    const domainEnd = {
                                        concept: changedFields.domain ? newDomain.concept : null,
                                        name: null,
                                        description: null,
                                        cardinality: changedFields.domainCardinality ? newDomain.cardinality : null,
                                        usageNote: null,
                                    } as SemanticModelRelationshipEndUsage;
                                    const rangeEnd = {
                                        concept: changedFields.range ? newRange.concept : null,
                                        name: changedFields.name ? name : null,
                                        description: changedFields.description ? description : null,
                                        cardinality: changedFields.rangeCardinality ? newRange.cardinality : null,
                                        usageNote: null,
                                    } as SemanticModelRelationshipEndUsage;

                                    let ends: SemanticModelRelationshipEndUsage[];
                                    if (
                                        currentDomainAndRange?.domainIndex == 1 &&
                                        currentDomainAndRange.rangeIndex == 0
                                    ) {
                                        ends = [rangeEnd, domainEnd];
                                    } else {
                                        ends = [domainEnd, rangeEnd];
                                    }

                                    createRelationshipEntityUsage(model, entity.type[0], {
                                        usageOf: entity.id,
                                        usageNote: usageNote,
                                        ends: ends,
                                    });
                                }
                                localClose();
                            }}
                        >
                            save
                        </button>
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
