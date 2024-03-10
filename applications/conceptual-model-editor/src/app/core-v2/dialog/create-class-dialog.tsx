import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useBaseDialog } from "./base-dialog";
import { generateName } from "../util/name-utils";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { MultiLanguageInputForLanguageString } from "./multi-language-input-4-language-string";

export const useCreateClassDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [model, setModel] = useState(null as unknown as InMemorySemanticModel);

    const localOpen = (model: InMemorySemanticModel) => {
        setModel(model);
        open();
    };

    const CreateClassDialog = () => {
        const [newName, setNewName] = useState<LanguageString>({ en: generateName() });
        const [newDescription, setNewDescription] = useState<LanguageString>({});
        const [newIri, setNewIri] = useState(`https://my-model.org/${newName["en"]!.toLowerCase().replace(" ", "-")}`);
        const { addClassToModel } = useModelGraphContext();

        return (
            <BaseDialog heading="Creating an entity">
                <div className="grid grid-cols-[25%_75%]">
                    <div className="font-semibold">new name:</div>
                    <div className="">
                        <MultiLanguageInputForLanguageString
                            ls={newName}
                            setLs={setNewName}
                            defaultLang="en"
                            inputType="text"
                        />
                    </div>
                    <div className="font-semibold">iri:</div>
                    <div>
                        <input className="w-[96%]" value={newIri} onChange={(e) => setNewIri(e.target.value)} />
                    </div>
                    <div className="font-semibold">description:</div>
                    <div>
                        <MultiLanguageInputForLanguageString
                            ls={newDescription}
                            setLs={setNewDescription}
                            defaultLang="en"
                            inputType="textarea"
                        />
                    </div>
                </div>

                <div className="flex flex-row justify-evenly">
                    <button
                        onClick={() => {
                            addClassToModel(model, newName, newIri, newDescription);
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
