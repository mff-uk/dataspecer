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
    isSemanticModelClass,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { getStringFromLanguageStringInLang } from "../util/language-utils";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

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
        const { models, createClassEntityUsage, createRelationshipEntityUsage } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels([...models.values()]);

        const [usageNote, setUsageNote] = useState<LanguageString>({});
        const [name, setName] = useState<LanguageString>({});
        const [description, setDescription] = useState<LanguageString>({});
        const [activeModel, setActiveModel] = useState(inMemoryModels.at(0)?.getId() ?? "---");
        const [domain, setDomain] = useState<SemanticModelRelationshipEnd | null>(null);

        const model = inMemoryModels.find((m) => m.getId() == activeModel);
        const entityName2 = getStringFromLanguageStringInLang(entity?.name ?? {}) ?? entity?.id;

        if (inMemoryModels.length == 0) {
            alert("Create a local model first, pls");
            localClose();
            return;
        }
        console.log(model, entity);
        return (
            <BaseDialog heading={`Create a profile ${entityName2 ? "of " + entityName2 : ""}`}>
                <div className="flex flex-row justify-evenly bg-slate-50">
                    <p>type: {entity?.type}</p>
                    <p>
                        active model:
                        <select name="models" id="models" onChange={(e) => setActiveModel(e.target.value)}>
                            {inMemoryModels
                                .map((m) => m.getId())
                                .map((mId) => (
                                    <option value={mId}>{mId}</option>
                                ))}
                        </select>
                    </p>
                </div>
                <p className="bg-slate-50 p-2">
                    usage (profile?) note:
                    <MultiLanguageInputForLanguageString
                        ls={usageNote}
                        setLs={setUsageNote}
                        defaultLang="en"
                        inputType="text"
                    />
                </p>

                <p className="bg-slate-50 p-2">
                    name:
                    <MultiLanguageInputForLanguageString ls={name} setLs={setName} defaultLang="en" inputType="text" />
                </p>
                <p className="bg-slate-50 p-2">
                    description:
                    <MultiLanguageInputForLanguageString
                        ls={description}
                        setLs={setDescription}
                        defaultLang="en"
                        inputType="textarea"
                    />
                </p>
                {(isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) && <p>domain: </p>}
                <div className="flex flex-row justify-evenly">
                    {model && entity ? (
                        <button
                            onClick={() => {
                                if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
                                    createClassEntityUsage(model, entity.type[0], {
                                        usageOf: entity.id,
                                        usageNote: usageNote,
                                        description,
                                        name,
                                    });
                                } else if (
                                    isSemanticModelRelationship(entity) ||
                                    isSemanticModelRelationshipUsage(entity)
                                ) {
                                    createRelationshipEntityUsage(model, entity.type[0], {
                                        usageOf: entity.id,
                                        usageNote: usageNote,
                                        description,
                                        name,
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
