import { useEffect, useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useBaseDialog } from "./base-dialog";
import { generateName } from "../util/name-utils";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { MultiLanguageInputForLanguageString } from "./multi-language-input-4-language-string";
import { getModelIri } from "../util/model-utils";
import { useConfigurationContext } from "../context/configuration-context";
import { getStringFromLanguageStringInLang } from "../util/language-utils";
import { IriInput, WhitespaceRegExp } from "./iri-input";
import { filterInMemoryModels } from "../util/utils";

export const useCreateClassDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);
    const [position, setPosition] = useState<{ x: number; y: number } | undefined>(undefined);

    const localOpen = (model?: InMemorySemanticModel, position?: { x: number; y: number }) => {
        setModel(model ?? null);
        setPosition(position);
        open();
    };

    const CreateClassDialog = () => {
        const { models } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels([...models.values()]);
        const [activeModel, setActiveModel] = useState(model ?? inMemoryModels.at(0));

        const { language: preferredLanguage } = useConfigurationContext();

        const [newName, setNewName] = useState<LanguageString>({ [preferredLanguage]: generateName() });
        const [newDescription, setNewDescription] = useState<LanguageString>({});
        const [iriHasChanged, setIriHasChanged] = useState(false);
        const [newIri, setNewIri] = useState(newName[preferredLanguage]?.toLowerCase().replace(WhitespaceRegExp, "-"));
        const { addClassToModel, aggregatorView } = useModelGraphContext();

        const modelIri = getModelIri(model);

        return (
            <BaseDialog heading="Creating an entity">
                <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pr-16">
                    <label className="font-bold" htmlFor="models">
                        active model:
                    </label>
                    <select
                        name="models"
                        id="models"
                        onChange={(e) => setActiveModel(inMemoryModels.find((m) => m.getId() == e.target.value))}
                        defaultValue={activeModel?.getId()}
                    >
                        {inMemoryModels.map((m) => (
                            <option value={m.getId()}>
                                {m.getAlias() ? m.getAlias() + ":" : null}
                                {m.getId()}
                            </option>
                        ))}
                    </select>
                    <div className="font-semibold">name:</div>
                    <div className="text-xl">
                        <MultiLanguageInputForLanguageString
                            ls={newName}
                            setLs={setNewName}
                            defaultLang={preferredLanguage}
                            inputType="text"
                        />
                    </div>
                    <div className="font-semibold">relative iri:</div>
                    <div className="flex flex-row">
                        <div className="text-nowrap">{modelIri}</div>
                        <IriInput
                            name={newName}
                            newIri={newIri}
                            setNewIri={(i) => setNewIri(i)}
                            iriHasChanged={iriHasChanged}
                            setIriHasChanged={(v) => setIriHasChanged(v)}
                        />
                    </div>
                    <div className="font-semibold">description:</div>
                    <div>
                        <MultiLanguageInputForLanguageString
                            ls={newDescription}
                            setLs={setNewDescription}
                            defaultLang={preferredLanguage}
                            inputType="textarea"
                        />
                    </div>
                </div>

                <div className="flex flex-row justify-evenly">
                    <button
                        onClick={() => {
                            if (!activeModel) {
                                alert("active model not set");
                                return;
                            }
                            if (!newIri) {
                                alert("iri not set");
                                return;
                            }
                            const { id: clsId } = addClassToModel(activeModel, newName, newIri, newDescription);
                            if (clsId) {
                                aggregatorView
                                    .getActiveVisualModel()
                                    ?.addEntity({ sourceEntityId: clsId, position: position ?? undefined });
                            }
                            close();
                        }}
                    >
                        save
                    </button>
                    <button onClick={close}>close</button>
                </div>
            </BaseDialog>
        );
    };

    return {
        isCreateClassDialogOpen: isOpen,
        closeCreateClassDialog: close,
        openCreateClassDialog: localOpen,
        CreateClassDialog,
    };
};
