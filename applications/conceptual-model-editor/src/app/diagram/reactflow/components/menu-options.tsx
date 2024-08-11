import React, { useEffect, useRef, useState } from "react";

export const useMenuOptions = () => {
    const [isMenuOptionsOpen, setIsMenuOptionsOpen] = useState(false);
    const menuOptionsRef = useRef<HTMLDivElement | null>(null);

    const close = (e?: React.MouseEvent | React.FocusEvent) => {
        setIsMenuOptionsOpen(false);
        if (e !== undefined) {
            e.stopPropagation();
        }
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
        // You have to actually define the type here explictly, typescript can't interfere the type correctly
        const handlersWithTexts: Array<[(() => void) | undefined, string]> = [      
            [openDetailHandler, "ℹ Detail"],
            [modifyHandler, "✏ Modify"],
            [undefined, "HorizontalSeparator"],
            [createProfileHandler, "🧲 Create profile"],            
            [undefined, "HorizontalSeparator"],
            [removeFromViewHandler, "🕶 Remove from view"],
            [deleteHandler, "🗑 Delete"],
        ];
        return MenuOptionsGeneral({handlersWithTexts, positionTailwind: position});        
    };    

    /**
     * 
     * @param props is an object with following properties:
     * - handlersWithTexts is an array of tuples. The first property specifies the handler called on click and the second one the name. 
     * Special case is if the handler is undefined and the name is "HorizontalSeparator".
     * - positionTailwind specifies the position in tailwind notation.
     * - positionCSS specifies the position in CSS notation. If both the tailwind and CSS positions are specified, the behavior is undefined.
     * @returns
     */
    const MenuOptionsGeneral = (props: {
        handlersWithTexts: Array<[(() => void) | undefined, string]>;
        positionTailwind?: string;
        positionCSS?: object;       // TODO: It might be possible to specify better type
    }) => {        
        const buttonsToRender = props.handlersWithTexts.map(e => {
            const [handler, text] = e;
            return ((text === "HorizontalSeparator" && handler === undefined) ? (<HorizontalSeparator />) :
                (handler === undefined) ? (<></>) : (<MenuButton text={text} onClick={handler} />));                               
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
                {
                    buttonsToRender
                }                
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
