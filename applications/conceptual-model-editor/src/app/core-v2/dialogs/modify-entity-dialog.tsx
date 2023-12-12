import { type SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { getNameOf, getDescriptionOf } from "../util/utils";
import { useModelGraphContext } from "../context/graph-context";

export const useModifyEntityDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const modifyDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [modifiedClass, setModifiedClass] = useState(null as unknown as SemanticModelClass);

    useEffect(() => {
        const { current: el } = modifyDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => {
        setIsOpen(false);
        setModifiedClass(null as unknown as SemanticModelClass);
    };
    const open = (cls: SemanticModelClass) => {
        setIsOpen(true);
        setModifiedClass(cls);
    };

    const ModifyEntityDialog = () => {
        const [newName, setNewName] = useState(getNameOf(modifiedClass).t);
        const [newDescription, setNewDescription] = useState(getDescriptionOf(modifiedClass)); // FIXME: sanitize
        const [newIri, setNewIri] = useState(modifiedClass.iri ?? ""); // FIXME: sanitize
        const { modifyClassInLocalModel } = useModelGraphContext();

        return (
            <dialog ref={modifyDialogRef} className="flex h-96 w-96 flex-col justify-between">
                <div>
                    <h4>Entity modification</h4>
                    <h5>
                        Detail of: <input value={newName} onChange={(e) => setNewName(e.target.value)} />@
                        {getNameOf(modifiedClass).l}
                    </h5>
                    <p className="text-gray-500">
                        <input value={newIri} onChange={(e) => setNewIri(e.target.value)} />
                    </p>
                </div>
                <p>type: {modifiedClass.type}</p>
                <p>
                    description: <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                </p>
                <p>attributes: todo: solve attributes</p>
                <div className="flex flex-row justify-evenly">
                    <button
                        onClick={() => {
                            console.log(newName, newIri, newDescription);
                            modifyClassInLocalModel(modifiedClass.id, {
                                name: { cs: newName },
                                iri: newIri,
                                description: { cs: newDescription },
                            });
                            close();
                        }}
                    >
                        save
                    </button>
                    <button onClick={close}>close</button>
                </div>
            </dialog>
        );
    };

    return {
        isModifyEntityDialogOpen: isOpen,
        closeModifyEntityDialog: close,
        openModifyEntityDialog: open,
        ModifyEntityDialog,
    };
};
