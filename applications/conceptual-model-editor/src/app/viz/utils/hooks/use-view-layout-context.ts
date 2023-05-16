"use client";

import React, { useContext } from "react";
import type { CimClass } from "../../model/cim-defs";
import type { ViewLayout } from "../../layout/view-layout";
import type { Position } from "../../layout/cim-layout";

export const ViewLayoutContext = React.createContext<ViewLayout>(null as unknown as ViewLayout);

export const useViewLayoutContext = () => {
    const viewLayoutContext = useContext(ViewLayoutContext);

    const handleChangePosition = (cls: CimClass, pos: Position) => {
        // console.log("handle change position shit called");
        viewLayoutContext.setPositionWithRef(cls, pos);
    };

    const addClassToView = (cls: CimClass) => {
        if (cls) {
            viewLayoutContext.addClassToView(cls);
        } else {
            throw new Error(
                "CimAction.ADD_CLASS_TO_VIEW should only be called with cimClass in cls and viewLayout as payload"
            );
        }
    };

    const toggleViewStyle = () => {
        console.log("toggling view style");
        viewLayoutContext.toggleViewStyle();
    };

    const removeClassFromView = (cls: CimClass) => {
        if (cls) {
            viewLayoutContext.removeClassFromView(cls);
        } else {
            throw new Error(
                "CimAction.ADD_CLASS_TO_VIEW should only be called with cimClass in cls and viewLayout as payload"
            );
        }
    };

    return { viewLayoutContext, addClassToView, handleChangePosition, removeClassFromView, toggleViewStyle };
};
