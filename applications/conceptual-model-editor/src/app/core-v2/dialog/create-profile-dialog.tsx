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
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useConfigurationContext } from "../context/configuration-context";
import { DomainRangeComponent } from "./domain-range-component";
import { getDescriptionLanguageString, getNameLanguageString } from "../util/name-utils";
import { getIri } from "../util/model-utils";

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

        // Relationships and relationship profiles
        const [currentRange, currentDomain] =
            isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)
                ? (entity.ends as SemanticModelRelationshipEnd[]) // TODO: tohle bys mohl predelat
                : [null, null];

        const [newRange, setNewRange] = useState(currentRange ?? ({} as SemanticModelRelationshipEnd));
        const [newDomain, setNewDomain] = useState(currentDomain ?? ({} as SemanticModelRelationshipEnd));

        const model = inMemoryModels.find((m) => m.getId() == activeModel);

        const nameOfProfiledEntity =
            getLocalizedStringFromLanguageString(getNameLanguageString(entity), preferredLanguage) ?? entity?.id;

        if (inMemoryModels.length == 0) {
            alert("Create a local model first, please");
            localClose();
            return;
        }
        console.log(model, entity);
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
                    <div>
                        <MultiLanguageInputForLanguageString
                            ls={name}
                            setLs={setName}
                            defaultLang={preferredLanguage}
                            inputType="text"
                        />
                    </div>

                    {/* 
                    -------------------
                    Profile description
                    -------------------
                    */}

                    <div className="font-semibold">description:</div>
                    <div>
                        <MultiLanguageInputForLanguageString
                            ls={description}
                            setLs={setDescription}
                            defaultLang={preferredLanguage}
                            inputType="textarea"
                        />
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
                        <DomainRangeComponent
                            entity={entity}
                            range={newRange}
                            setRange={setNewRange}
                            domain={newDomain}
                            setDomain={setNewDomain}
                        />
                    )}
                </div>

                <div className="flex flex-row justify-evenly">
                    {model && entity ? (
                        <button
                            onClick={() => {
                                if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
                                    const { id: classUsageId } = createClassEntityUsage(model, entity.type[0], {
                                        usageOf: entity.id,
                                        usageNote: usageNote,
                                        description,
                                        name,
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
                                    createRelationshipEntityUsage(model, entity.type[0], {
                                        usageOf: entity.id,
                                        usageNote: usageNote,
                                        description,
                                        name,
                                        ends: [
                                            {
                                                concept: newRange.concept,
                                                name: newRange.name,
                                                description: newRange.description,
                                                cardinality: newRange.cardinality ?? null,
                                                usageNote: null,
                                            },
                                            {
                                                concept: newDomain.concept,
                                                name: newDomain.name,
                                                description: newDomain.description,
                                                cardinality: newDomain.cardinality ?? null,
                                                usageNote: null,
                                            },
                                        ],
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
