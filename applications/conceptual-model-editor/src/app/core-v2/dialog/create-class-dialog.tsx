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

export const useCreateClassDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [model, setModel] = useState(null as unknown as InMemorySemanticModel);

    const localOpen = (model: InMemorySemanticModel) => {
        setModel(model);
        open();
    };
    const whitespaceRegexp = new RegExp(/\s+/g);

    const CreateClassDialog = () => {
        const { language: preferredLanguage } = useConfigurationContext();

        const [newName, setNewName] = useState<LanguageString>({ [preferredLanguage]: generateName() });
        const [newDescription, setNewDescription] = useState<LanguageString>({});
        const [iriHasChanged, setIriHasChanged] = useState(false);
        const [newIri, setNewIri] = useState(newName[preferredLanguage]?.toLowerCase().replace(whitespaceRegexp, "-"));
        const { addClassToModel, aggregatorView } = useModelGraphContext();

        const modelIri = getModelIri(model);

        // change iri based on entity name
        useEffect(() => {
            if (iriHasChanged) {
                return;
            }

            const [n, l] = getStringFromLanguageStringInLang(newName, preferredLanguage);

            if (l == null && n) {
                setNewIri(n.trim().toLowerCase().replaceAll(whitespaceRegexp, "-"));
            }
        }, [newName]);

        return (
            <BaseDialog heading="Creating an entity">
                <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pr-16">
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
                        <input
                            className="w-full"
                            value={newIri}
                            onChange={(e) => {
                                setNewIri(e.target.value);
                                setIriHasChanged(true);
                            }}
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
                            if (!newIri) {
                                alert("iri not set");
                                return;
                            }
                            const { id: clsId } = addClassToModel(model, newName, newIri, newDescription);
                            if (clsId) {
                                aggregatorView.getActiveVisualModel()?.addEntity({ sourceEntityId: clsId });
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
