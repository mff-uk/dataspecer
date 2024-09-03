import React, { createContext, useState, useMemo } from "react";
import {
  DialogApiContextType,
  DialogRendererContextType,
  createInitialDialogContextStateType,
  createDialogApiContext,
  createDialogRendererContext,
} from "./dialog-service";

export const DialogApiContext = createContext<DialogApiContextType | null>(null);

export const DialogRendererContext = createContext<DialogRendererContextType<any> | null>(null);

/**
 * Use this instead of  DialogsContextProvider from ./context/dialogs-context.tsx .
 */
export function DialogContextProvider(props: { children: React.ReactNode }) {
  const [state, setState] = useState(createInitialDialogContextStateType());

  const api = useMemo(() => createDialogApiContext(setState), [setState]);

  const renderer = useMemo(() => createDialogRendererContext(state, setState), [state, setState]);

  return (
    <DialogApiContext.Provider value={api}>
      <DialogRendererContext.Provider value={renderer}>
        {props.children}
      </DialogRendererContext.Provider>
    </DialogApiContext.Provider>
  )
}
