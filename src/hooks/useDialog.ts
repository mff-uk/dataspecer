import React, {useCallback, useState} from "react";
import {useToggle} from "./useToggle";

// noinspection JSUnusedLocalSymbols
/**
 * This hook expects a standard dialog component <SomeDialog isOpen close dynamic_parameter other_parameters>
 * and specification of dynamic_parameter and returns
 *  - a component having only other_parameters
 *  - a close functions, which closes the dialog
 *  - an open({dynamic_parameter: type_of_dynamic_parameter}) function taking argument that will be set and dialog
 * opened
 */
export const useDialog = <Property extends keyof Parameters, Parameters extends {isOpen: boolean, close: () => void}>(dialog: React.FC<Parameters>, static_type: Property[], initialState: Pick<Parameters, Property> | undefined = undefined) => {
    const toggle = useToggle();
    const [state, setState] = useState<Pick<Parameters, Property>>(initialState as Pick<Parameters, Property>);

    const open = useCallback((data: Pick<Parameters, Property>) => {
        setState(data);
        toggle.open();
    }, [toggle]);

    const component = useCallback((properties: Omit<Parameters, Property | "isOpen" | "close">) =>
        React.createElement(dialog, {...properties, ...state, close: toggle.close, isOpen: toggle.isOpen} as Parameters), [dialog, state, toggle.close, toggle.isOpen]);

    return {
        component,
        open,
        close: toggle.close
    }
}
