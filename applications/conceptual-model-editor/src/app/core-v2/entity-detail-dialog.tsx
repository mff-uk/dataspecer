import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { getNameOf, getDescriptionOf } from "./util/utils";

export const useEntityDetailDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const editDialogRef = useRef(null as unknown as HTMLDialogElement);

    useEffect(() => {
        const { current: el } = editDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => setIsOpen(false);
    const open = () => setIsOpen(true);

    const EntityDetailDialog = (props: { cls: SemanticModelClass }) => (
        <dialog ref={editDialogRef} className="flex h-96 w-96 flex-col justify-between">
            <div>
                <h5>Detail of: {getNameOf(props.cls)}</h5>
                <p className=" text-gray-500">{props.cls.iri}</p>
            </div>
            <p>type: {props.cls.type}</p>
            <p>{getDescriptionOf(props.cls)}</p>
            <div className="flex flex-row justify-evenly">
                <button onClick={close}>close</button>
            </div>
        </dialog>
    );

    return {
        isEntityDetailDialogOpen: isOpen,
        closeEntityDetailDialog: close,
        openEntityDetailDialog: open,
        EntityDetailDialog,
    };
};
