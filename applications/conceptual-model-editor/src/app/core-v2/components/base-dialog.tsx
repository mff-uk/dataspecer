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
                className="z-30 flex max-h-[95%] min-h-[70%] w-[70%] flex-col gap-10 p-4"
                onCancel={(e) => {
                    e.preventDefault();
                    close();
                }}
                onMouseDown={(e) => {
                    const rect = dialogRef.current.getBoundingClientRect();
                    const clickedInRect = clickedInside(rect, e.clientX, e.clientY);
                    if (!clickedInRect) {
                        close();
                    }
                }}
            >
                <div>
                    <h1 className="text-xl">{heading}</h1>
                </div>
                {children}
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
