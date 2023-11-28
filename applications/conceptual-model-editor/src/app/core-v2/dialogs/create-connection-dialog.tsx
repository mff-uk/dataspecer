import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { getNameOf, getDescriptionOf } from "../util/utils";
import { Connection } from "reactflow";

export const useCreateConnectionDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const createConnectionDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [connectionCreated, setConnectionCreated] = useState(null as unknown as Connection);

    useEffect(() => {
        const { current: el } = createConnectionDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => setIsOpen(false);
    const open = (connection: Connection) => {
        setConnectionCreated(connection);
        setIsOpen(true);
    };

    const CreateConnectionDialog = () => {
        if (!connectionCreated) {
            close();
            return <></>;
        }
        const { source, target } = connectionCreated;
        return (
            <dialog ref={createConnectionDialogRef} className="z-50 flex h-96 w-96 flex-col justify-between">
                <div>
                    <h5>{`Connection from: ${source} to: ${target}`}</h5>
                    <p className=" text-gray-500">{/* {props.cls.iri} */}</p>
                </div>
                <p>type: connection</p>
                <p>cardinalities: todo</p>
                <p>description: todo</p>
                <div className="flex flex-row justify-evenly">
                    <button
                        onClick={() => {
                            // console.log(newName, newIri, newDescription);
                            // props.save({ name: { cs: newName }, iri: newIri, description: { cs: newDescription } });
                            close();
                        }}
                    >
                        confirm
                    </button>
                    <button onClick={close}>close</button>
                </div>
            </dialog>
        );
    };

    return {
        isCreateConnectionDialogOpen: isOpen,
        closeCreateConnectionDialog: close,
        openCreateConnectionDialog: open,
        CreateConnectionDialog,
    };
};
