import { XYPosition } from "reactflow";
import { useMenuOptions } from "./menu-options";
import { useState } from "react";

export const useCanvasMenuOptions = () => {

  const { 
    MenuOptionsGeneral,
    isMenuOptionsOpen,
    openMenuOptions: open,
    closeMenuOptions: close, 
    } = useMenuOptions();

    const [canvasMenuXYPosition, setCanvasMenuXYPosition] = useState<XYPosition>();

    const CanvasMenuOptions = (props: {    
            openCreateClassDialogHandler: () => void;  
            openSelectClassDialog: () => void;
        }) => {


        const handlersWithTexts: Array<[(() => void) | undefined, string]> = [      
            [props.openCreateClassDialogHandler, "➕ Create new class"],
            [undefined, "HorizontalSeparator"],
            [props.openSelectClassDialog, "🕮 Choose existing classes"],
            [undefined, "HorizontalSeparator"],
            [close, "❌ Close menu"],                    
        ];

    
        // The most important implication of how Tailwind extracts class names is that it will only find classes that exist as complete unbroken strings in your source files. 
        // If you use string interpolation or concatenate partial class names together, Tailwind will not find them, so we have to use CSS position
        // ( https://tailwindcss.com/docs/content-configuration#dynamic-class-names )
        // const positionTailwind = `absolute left-[${xyPosition?.x ?? 500}px] top-[${xyPosition?.y ?? 250}px] z-10`;
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