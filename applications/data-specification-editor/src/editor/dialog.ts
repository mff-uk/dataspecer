import {Dialog, DialogProps} from "@mui/material";
import React, {FunctionComponent, useCallback, useState} from "react";
import {useToggle} from "./hooks/use-toggle";

type FunctionComponentParameters<Component> = Component extends FunctionComponent<infer P> ? P : never;
export type UseDialogOpenFunction<Dialog extends FunctionComponent<any>, staticParameters extends keyof FunctionComponentParameters<Dialog> = never> = (data: Omit<FunctionComponentParameters<Dialog>, staticParameters | "isOpen" | "close">) => void;
export interface DialogParameters {
    isOpen: boolean,
    close: () => void,
}

/**
 * Wraps component with {@link Dialog} element and automatically passes isOpen and close props.
 *
 * It is used because Mui Dialog keeps inner component unmounted if closed, therefore by separating the inner part we optimize hook calls.
 * @param dialogProps
 * @param Node
 */
export const dialog =
  <ComponentProperties>(
    dialogProps: Omit<DialogProps, "open" | "onClose">,
    Node: FunctionComponent<
      ComponentProperties & {isOpen: boolean, close: () => void}>
  ) =>
    (props: ComponentProperties & {isOpen: boolean, close: () => void}) =>
      React.createElement(
        Dialog,
        {open: props.isOpen, onClose: props.close, ...dialogProps},
        React.createElement(Node, props)
      );

/**
 * Transforms a dialog into a component having only specified `StaticParameters` as props. Other props need to be passed in open function.
 * @param dialog
 * @param staticParameters
 */
export const useDialog = <Parameters extends {isOpen: boolean, close: () => void}, StaticParameters extends keyof Parameters = never>(dialog: React.FC<Parameters>, staticParameters: StaticParameters[] = []) => {
    const toggle = useToggle();
    const [state, setState] = useState<Omit<Parameters, StaticParameters | "isOpen" | "close">>();

    const open = useCallback((data: Omit<Parameters, StaticParameters | "isOpen" | "close">) => {
        setState(data);
        toggle.open();
    }, [toggle]);

    const Component = useCallback((properties: Pick<Parameters, StaticParameters>) =>
        React.createElement(dialog, {...properties, ...state, close: toggle.close, isOpen: toggle.isOpen} as Parameters), [dialog, state, toggle.close, toggle.isOpen]);

    return {
        Component,
        open,
        close: toggle.close
    }
}

