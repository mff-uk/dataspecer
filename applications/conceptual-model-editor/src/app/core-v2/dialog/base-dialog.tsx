import { createRdfsModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { useRef, useEffect, useState } from "react";
import { clickedInside } from "../util/utils";

export const useBaseDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dialogRef = useRef(null as unknown as HTMLDialogElement);

    useEffect(() => {
        const { current: el } = dialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => {
        setIsOpen(false);
    };

    const open = () => {
        setIsOpen(true);
    };
    const save = async () => {
        close();
    };

    const BaseDialog: React.FC<{
        children: React.ReactNode;
        heading: string;
    }> = ({ children, heading }) => {
        return (
            <dialog
                ref={dialogRef}
                className="flex h-96 w-96 flex-col justify-between"
                onCancel={(e) => {
                    e.preventDefault();
                    close();
                }}
                onClick={(e) => {
                    const rect = dialogRef.current.getBoundingClientRect();
                    const clickedInRect = clickedInside(rect, e.clientX, e.clientY);
                    if (!clickedInRect) {
                        close();
                    }
                }}
            >
                <div>
                    <h1>{heading}</h1>
                </div>
                {children}

                {/* <div className="flex flex-row justify-evenly">
                    <button
                    >
                        confirm
                    </button>
                    <button onClick={close}>close</button>
                </div> */}
            </dialog>
        );
    };

    return {
        isOpen,
        close,
        open,
        BaseDialog,
    };
};
