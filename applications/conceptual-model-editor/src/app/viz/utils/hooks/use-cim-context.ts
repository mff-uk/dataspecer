"use client";

import React, { useContext } from "react";
import type { CimClass, Cim, Attribute } from "../../model/cim-defs";

export interface CimStateContextType {
    cims: Cim[];
    highlightedElement?: CimClass;
}

export const CimContext = React.createContext<CimStateContextType>({
    cims: [],
    highlightedElement: undefined,
});

export const useCimContext = () => {
    const cimContext = useContext(CimContext);

    const addAttribute = (cls: CimClass, attribute: Attribute) => {
        cls.addAttribute(attribute);
    };

    const removeAttribute = (cls: CimClass, attribute: Attribute) => {
        cls.removeAttribute(attribute.name);
    };

    const focusOnElement = (cls: CimClass) => {
        console.log(`trying to focus on ${cls.name}`);
    };

    const removeFocus = () => {
        console.log("remove focus called in use cim context hook");
    };

    return { cimContext, addAttribute, removeAttribute, focusOnElement, removeFocus };
};
