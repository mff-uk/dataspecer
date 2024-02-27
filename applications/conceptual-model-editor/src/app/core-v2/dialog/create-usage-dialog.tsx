import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useBaseDialog } from "./base-dialog";
import { filterInMemoryModels } from "../util/utils";
import { MultiLanguageInputForLanguageString } from "./multi-language-input-4-language-string";
import {
    LanguageString,
    SemanticModelClass,
    SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { getNameOrIriAndDescription, getStringFromLanguageStringInLang } from "../util/language-utils";

export const useCreateUsageDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [entity, setEntity] = useState<SemanticModelClass | SemanticModelRelationship | null>(null);

    const localOpen = (entity: SemanticModelClass | SemanticModelRelationship) => {
        setEntity(entity);
        open();
    };

    const localClose = () => {
        setEntity(null);
        close();
    };

    const CreateUsageDialog = () => {
        const { models, createEntityUsage } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels([...models.values()]);

        const [usageNote, setUsageNote] = useState<LanguageString>({});
        const [name, setName] = useState<LanguageString>({});
        const [description, setDescription] = useState<LanguageString>({});
        const [activeModel, setActiveModel] = useState(inMemoryModels.at(0)?.getId() ?? "---");

        const model = inMemoryModels.find((m) => m.getId() == activeModel);
        const [entityName] = getNameOrIriAndDescription(entity, entity?.iri || entity?.id || "");

        console.log(model, entity);
        return (
            <BaseDialog heading={`Create a usage${entityName ? " of " + entityName : ""}`}>
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
                <p className="bg-slate-50 p-2">
                    usage note:
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
                <div className="flex flex-row justify-evenly">
                    {model && entity ? (
                        <button
                            onClick={() => {
                                createEntityUsage(model, entity.type[0], {
                                    usageOf: entity.id,
                                    usageNote: usageNote,
                                    description,
                                    name,
                                });
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
        isCreateUsageDialogOpen: isOpen,
        closeCreateUsageDialog: close,
        openCreateUsageDialog: localOpen,
        CreateUsageDialog,
    };
};
