import { useEffect, useRef, useState } from "react";

export const useMenuOptions = () => {
    const [isMenuOptionsOpen, setIsMenuOptionsOpen] = useState(false);
    const menuOptionsRef = useRef<HTMLDivElement | null>(null);

    const close = (e: React.MouseEvent) => {
        setIsMenuOptionsOpen(false);
        e.stopPropagation();
    };

    const open = () => {
        setIsMenuOptionsOpen(true);
    };

    useEffect(() => {
        if (isMenuOptionsOpen && menuOptionsRef.current) {
            menuOptionsRef.current.focus();
        }
    }, [isMenuOptionsOpen]);

    const MenuButton = (props: { onClick?: () => void; text: string }) => {
        return (
            <button
                id={`button-menu-options-${props.text}`}
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
                ref={menuOptionsRef}
                tabIndex={-1}
                style={{ pointerEvents: "all" }}
                className={`flex flex-col bg-white [&>*]:px-5 [&>*]:text-left ${props.position ? props.position : ""}`}
                onBlur={(e) => {
                    console.log("blur event ", e);
                    if (e.relatedTarget?.id.startsWith("button-menu-options-")) {
                        return;
                    }
                    close(e);
                }}
            >
                <MenuButton text="close" />
                <MenuButton text="ℹ open detail" onClick={openDetailHandler} />
                {createProfileHandler && <MenuButton text="🧲 create profile" onClick={createProfileHandler} />}
                {removeFromViewHandler && <MenuButton text="🕶 remove from view" onClick={removeFromViewHandler} />}
                {modifyHandler && <MenuButton text="✏ modify" onClick={modifyHandler} />}
                {deleteHandler && <MenuButton text="🗑 delete" onClick={deleteHandler} />}
            </div>
        );
    };

    return {
        MenuOptions,
        isMenuOptionsOpen,
        openMenuOptions: open,
    };
};
