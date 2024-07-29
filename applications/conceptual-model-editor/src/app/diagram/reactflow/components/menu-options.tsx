import { useEffect, useRef, useState } from "react";

export const useMenuOptions = () => {
    const [isMenuOptionsOpen, setIsMenuOptionsOpen] = useState(false);
    const menuOptionsRef = useRef<HTMLDivElement | null>(null);

    const close = (e: React.MouseEvent | React.FocusEvent) => {
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
                className="hover:shadow py-2"
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
                className={`flex flex-col bg-white border-2 border-slate-400 border-solid [&>*]:px-5 [&>*]:text-left ${props.position ? props.position : ""}`}
                onBlur={(event) => {
                    if (event.relatedTarget?.id.startsWith("button-menu-options-")) {
                        return;
                    }
                    close(event);
                }}
            >
                <MenuButton text="ℹ Detail" onClick={openDetailHandler} />
                {modifyHandler === undefined ? null :
                    <MenuButton text="✏ Modify" onClick={modifyHandler} />}
                <HorizontalSeparator />
                {createProfileHandler === undefined ? null : <>
                    <MenuButton text="🧲 Create profile" onClick={createProfileHandler} />
                    <HorizontalSeparator />
                </>}
                {removeFromViewHandler === undefined ? null :
                    <MenuButton text="🕶 Remove from view" onClick={removeFromViewHandler} />}
                {deleteHandler === undefined ? null :
                    <MenuButton text="🗑 Delete" onClick={deleteHandler} />}
            </div>
        );
    };

    return {
        MenuOptions,
        isMenuOptionsOpen,
        openMenuOptions: open,
    };
};

const HorizontalSeparator = () => <hr className="h-0.5 border-none bg-slate-300" />;
