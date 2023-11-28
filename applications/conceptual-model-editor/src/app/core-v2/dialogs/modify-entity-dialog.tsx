import { type SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { getNameOf, getDescriptionOf } from "../util/utils";

export const useModifyEntityDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const modifyDialogRef = useRef(null as unknown as HTMLDialogElement);

    useEffect(() => {
        const { current: el } = modifyDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => setIsOpen(false);
    const open = () => setIsOpen(true);

    const ModifyEntityDialog = (props: {
        cls: SemanticModelClass;
        save: (entity: Partial<Omit<SemanticModelClass, "type" | "id">>) => void;
    }) => {
        const [newName, setNewName] = useState(getNameOf(props.cls));
        const [newDescription, setNewDescription] = useState(getDescriptionOf(props.cls)); // FIXME: sanitize
        const [newIri, setNewIri] = useState(props.cls.iri ?? ""); // FIXME: sanitize

        return (
            <dialog ref={modifyDialogRef} className="flex h-96 w-96 flex-col justify-between">
                <div>
                    <h4>Entity modification</h4>
                    <h5>
                        Detail of: <input value={newName} onChange={(e) => setNewName(e.target.value)} />
                    </h5>
                    <p className="text-gray-500">
                        <input value={newIri} onChange={(e) => setNewIri(e.target.value)} />
                    </p>
                </div>
                <p>type: {props.cls.type}</p>
                <p>
                    <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                </p>
                <div className="flex flex-row justify-evenly">
                    <button
                        onClick={() => {
                            console.log(newName, newIri, newDescription);
                            props.save({ name: { cs: newName }, iri: newIri, description: { cs: newDescription } });
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
