import React, { useEffect, useRef, useState } from "react";

export type MenuOptionsHandler = (() => void) | undefined | "Horizontal Separator" | "Close Menu";

export type HandlerWithLabel = {
    /**
     * Specifies the handler called on click.
     * Special cases are: If the handler is "Horizontal Separator". If the handler is undefined it is skipped, if it is "Close Menu", then the button just closes the menu.
     */
    handler: MenuOptionsHandler,
    /**
     * Specifies the name
     */
    label: string
}

type MenuOptionsGeneralPropsType = {
    /**
     * is an array of objects of type {@link HandlerWithLabel}.
     */
    handlersWithTexts: Array<HandlerWithLabel>,
    /**
     * Specifies the position in tailwind notation.
     */
    positionTailwind?: string,
    /**
     * Specifies the position in CSS notation. If both the tailwind and CSS positions are specified, the behavior is undefined.
     */
    positionCSS?: object,
};

export const useMenuOptions = () => {
    const [isMenuOptionsOpen, setIsMenuOptionsOpen] = useState(false);
    const menuOptionsRef = useRef<HTMLDivElement | null>(null);

    const close = (event: React.MouseEvent | React.FocusEvent) => {
        setIsMenuOptionsOpen(false);
        event.stopPropagation();
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
        const { openDetailHandler, createProfileHandler, modifyHandler, removeFromViewHandler, deleteHandler, position } = props;
        const handlersWithTexts: Array<HandlerWithLabel> = [
            {handler: openDetailHandler, label: "ℹ Detail"},
            {handler: modifyHandler, label: "✏ Modify"},
            {handler: "Horizontal Separator", label: ""},
            {handler: createProfileHandler, label: "🧲 Create profile"},
            {handler: "Horizontal Separator", label: ""},
            {handler: removeFromViewHandler, label: "🕶 Remove from view"},
            {handler: deleteHandler, label: "🗑 Delete"},
        ];
        return MenuOptionsGeneral({handlersWithTexts, positionTailwind: position});
    };



    const MenuOptionsGeneral = (props: MenuOptionsGeneralPropsType) => {
        if(!isMenuOptionsOpen) {
            return null;
        }


        const buttonsAndHorizontalSeparatorsToRender = props.handlersWithTexts.map(handlerWithLabel => {
            const { handler, label: text} = handlerWithLabel;
            if(handler === "Horizontal Separator") {
                return <><HorizontalSeparator /></>;
            }
            else if(handler === undefined) {
                return null;
            }
            else if(handler === "Close Menu") {
                return <><MenuButton text={"❌ Close menu"} onClick={undefined} /></>;
            }
            else {
                return <><MenuButton text={text} onClick={handler} /></>;
            }
        });


        let style: React.CSSProperties = { pointerEvents: "all" };
        if (props.positionCSS !== undefined) {
            style = {
                ...style,
                ...props.positionCSS
            };
        }
        return (
            <div
                ref={menuOptionsRef}
                tabIndex={-1}
                style={style}
                className={`flex flex-col bg-white border-2 border-slate-400 border-solid [&>*]:px-5 [&>*]:text-left ${props.positionTailwind ? props.positionTailwind : ""}`}
                onBlur={(event) => {
                    if (event.relatedTarget?.id.startsWith("button-menu-options-")) {
                        return;
                    }
                    close(event);
                }}
            >
                {buttonsAndHorizontalSeparatorsToRender}
            </div>
        );
    };

    return {
        MenuOptions,
        MenuOptionsGeneral,
        isMenuOptionsOpen,
        openMenuOptions: open,
        closeMenuOptions: close,
    };
};

const HorizontalSeparator = () => <hr className="h-0.5 border-none bg-slate-300" />;
