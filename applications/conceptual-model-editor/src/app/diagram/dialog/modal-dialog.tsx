import { useRef, useEffect, type SyntheticEvent, type MouseEvent } from "react";

export const ModalDialog: React.FC<{
    /**
     * Heading to show.
     */
    heading: string,
    /**
     * Content of the dialog.
     */
    content: React.ReactNode,
    /**
     * Dialgo footer.
     */
    footer: React.ReactNode,
    /**
     * True when dialog is open.
     */
    isOpen: boolean,
    /**
     * True to allow close on backdrop.
     */
    closeOnBackdrop?: boolean,
    /**
     * Callback when closing the dialog.
     */
    onCancel: () => void,
}> = (props) => {
    const {heading, isOpen} = props;

    const dialogReference = useRef(null as unknown as HTMLDialogElement);

    const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
        event.preventDefault();
        props.onCancel();
    };

    const onMouseDown = (event: MouseEvent<HTMLDialogElement>) => {
        if (!props.closeOnBackdrop) {
            return;
        }
        const rectangle = dialogReference.current.getBoundingClientRect();
        const clickedInRect = inRectangle(event.clientX, event.clientY, rectangle);
        if (clickedInRect) {
            return;
        }
        props.onCancel();
    };

    useEffect(() => {
        const { current: element } = dialogReference;
        if (isOpen && element !== null) {
            element.showModal();
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <dialog
            ref={dialogReference}
            className="base-dialog z-30 flex min-h-[70%] w-[97%] flex-col p-1 md:max-h-[95%] md:w-[70%] md:p-4"
            onCancel={onCancel}
            onMouseDown={onMouseDown}
        >
            <h1 className="text-xl">{heading}</h1>
            <hr className="my-2"/>
            <div>
                {props.content}
            </div>
            <div className="mt-auto flex flex-row justify-evenly font-semibold">
                {props.footer}
            </div>
        </dialog>
    );
};

const inRectangle = (x: number, y: number, rectangle: DOMRect) => {
    const offset = 15;
    return (
        rectangle.top + offset <= y &&
        y <= rectangle.top + rectangle.height + offset &&
        rectangle.left - offset <= x &&
        x <= rectangle.left + rectangle.width + offset
    );
};
