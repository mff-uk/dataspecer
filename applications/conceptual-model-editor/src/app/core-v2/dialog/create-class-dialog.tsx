import { useState } from "react";
import { useModelGraphContext } from "../context/graph-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useBaseDialog } from "./base-dialog";
import { generateName } from "../util/name-utils";

export const useCreateClassDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [model, setModel] = useState(null as unknown as InMemorySemanticModel);

    const localOpen = (model: InMemorySemanticModel) => {
        setModel(model);
        open(() => {});
    };

    const CreateClassDialog = () => {
        const [newName, setNewName] = useState(generateName());
        const [newDescription, setNewDescription] = useState("");
        const [newIri, setNewIri] = useState(`https://my-model.org/${newName.toLowerCase().replace(" ", "-")}`);
        const { addClassToModel } = useModelGraphContext();

        return (
            <BaseDialog heading="Creating an entity">
                <p>
                    name: <input value={newName} onChange={(e) => setNewName(e.target.value)} />
                </p>
                <p>
                    iri: <input value={newIri} onChange={(e) => setNewIri(e.target.value)} />
                </p>
                <p>
                    description: <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                </p>

                <div className="flex flex-row justify-evenly">
                    <button
                        onClick={() => {
                            addClassToModel(
                                model,
                                { en: newName },
                                newIri,
                                newDescription.length ? { en: newDescription } : undefined
                            );
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
