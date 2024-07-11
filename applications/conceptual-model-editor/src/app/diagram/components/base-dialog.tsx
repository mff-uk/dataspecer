import { useRef, useEffect, useState } from "react";

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

    const BaseDialog: React.FC<{
        children: React.ReactNode;
        heading: string;
    }> = ({ children, heading }) => {
        return (
            <dialog
                ref={dialogRef}
                className="base-dialog z-30 flex min-h-[70%] w-[97%] flex-col p-1 md:max-h-[95%] md:w-[70%] md:p-4"
                onCancel={(e) => {
                    e.preventDefault();
                    close();
                }}
            >
                <h1 className="text-xl">{heading}</h1>
                <hr className="my-2"/>
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
