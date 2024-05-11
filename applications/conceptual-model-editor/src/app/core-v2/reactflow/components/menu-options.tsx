import { useState } from "react";

export const useMenuOptions = () => {
    const [isMenuOptionsOpen, setIsMenuOptionsOpen] = useState(false);

    const close = (e: any) => {
        setIsMenuOptionsOpen(false);
        e.stopPropagation();
    };

    const open = () => {
        setIsMenuOptionsOpen(true);
    };

    const MenuButton = (props: { onClick?: () => void; text: string }) => {
        return (
            <button
                type="button"
                className={`hover:shadow ${props.text == "close" ? "text-red-700" : ""}`}
                onClick={(e) => {
                    props.onClick?.();
                    close(e);
                }}
            >
                {props.text}
            </button>
        );
    };

    const MenuOptions = (props: {
        openDetailHandler: () => void;
        createProfileHandler?: () => void;
        modifyHandler?: () => void;
        removeFromViewHandler?: () => void;
        deleteHandler?: () => void;
        position?: string;
    }) => {
        const { openDetailHandler, createProfileHandler, modifyHandler, removeFromViewHandler, deleteHandler } = props;

        return (
            <div
                style={{ pointerEvents: "all" }}
                className={`flex w-max flex-col bg-white [&>*]:px-5 [&>*]:text-left  ${
                    props.position ? props.position : ""
                }`}
                onBlur={close}
            >
                <MenuButton text="close" />
                <MenuButton text="open detail" onClick={openDetailHandler} />
                {createProfileHandler && <MenuButton text="create profile" onClick={createProfileHandler} />}
                {removeFromViewHandler && <MenuButton text="remove from view" onClick={removeFromViewHandler} />}
                {modifyHandler && <MenuButton text="modify" onClick={modifyHandler} />}
                {deleteHandler && <MenuButton text="delete" onClick={deleteHandler} />}
            </div>
        );
    };

    return {
        MenuOptions,
        isMenuOptionsOpen,
        openMenuOptions: open,
    };
};
