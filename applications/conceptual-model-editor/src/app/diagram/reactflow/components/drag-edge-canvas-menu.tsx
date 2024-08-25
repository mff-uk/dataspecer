import { XYPosition } from "reactflow";
import { HandlerWithLabel, MenuOptionsHandler, useMenuOptions } from "./menu-options";
import { useState } from "react";

export const useCanvasMenuOptions = () => {

  const {
    MenuOptionsGeneral,
    isMenuOptionsOpen,
    openMenuOptions: open,
    } = useMenuOptions();

    const [canvasMenuXYPosition, setCanvasMenuXYPosition] = useState<XYPosition>();

    const CanvasMenuOptions = (props: {
            openCreateClassDialogHandler: () => void;
            openSelectClassesDialogHandler: () => void;
        }) => {


        const handlersWithTexts: Array<HandlerWithLabel> = [
            { handler: props.openCreateClassDialogHandler, label: "➕ Create new class" },
            { handler: "Horizontal Separator", label: "" },
            { handler: props.openSelectClassesDialogHandler, label: "🕮 Choose existing classes" },
            { handler: "Horizontal Separator", label: "" },
            { handler: "Close Menu", label: "" },
        ];


        // The most important implication of how Tailwind extracts class names is that it will only find classes that exist as complete unbroken strings in your source files.
        // If you use string interpolation or concatenate partial class names together, Tailwind will not find them, so we have to use CSS position
        // ( https://tailwindcss.com/docs/content-configuration#dynamic-class-names )
        const positionCSS = {
            position: "absolute",
            left: `${canvasMenuXYPosition?.x ?? 500}px`,
            top: `${canvasMenuXYPosition?.y ?? 250}px`,
            zIndex: 10
        };

        return MenuOptionsGeneral({handlersWithTexts, positionCSS});
    };

    return {
        CanvasMenuOptions,
        openCanvasMenuOptions: open,
        isCanvasMenuOptionsOpen: isMenuOptionsOpen,
        canvasMenuXYPosition,
        setCanvasMenuXYPosition,
    };
};