import React, { useContext, useState } from "react";
import { type Position, ViewStyle, type ViewLayout2 } from "../../layout/view-layout";
import { Cim, CimClass } from "../../model/cim-defs";
import { getRandomPosition } from "../../../utils/random-gen";

export type ViewLayoutContext2Type = {
    viewLayout: ViewLayout2;
    setViewLayout: React.Dispatch<React.SetStateAction<ViewLayout2>>;
};

export const ViewLayoutContext2 = React.createContext(null as unknown as ViewLayoutContext2Type);

export const useViewLayoutContext2 = () => {
    const { viewLayout, setViewLayout } = useContext(ViewLayoutContext2);
    // const viewLayoutCls = new ViewLayout(viewLayout);

    const addClassToView = (cls: CimClass) => {
        viewLayout.elementPositionMapWithClassRef.set(
            cls,
            getRandomPosition(viewLayout.paperSize.x, viewLayout.paperSize.y)
        );
        setViewLayout({ ...viewLayout });
    };

    const removeFromView = (cls: CimClass) => {
        console.log("gonna remove from vieew", cls);

        const newViewLayout = viewLayout;
        if (newViewLayout.elementPositionMapWithClassRef.delete(cls)) {
            setViewLayout({ ...newViewLayout });
        }
    };

    const setPositionOf = (cls: CimClass, position: Position) => {
        setViewLayout({
            ...viewLayout,
            elementPositionMapWithClassRef: viewLayout.elementPositionMapWithClassRef.set(cls, position),
        });
    };

    const colorOfCim = (cimId: string) => {
        const color = viewLayout.cimColorMap[cimId];
        if (!color) {
            const newColor = "lightyellow";
            console.log("Color of cim[" + cimId + "] not defined, gonna make it " + newColor);
            viewLayout.cimColorMap[cimId] = newColor;
            setViewLayout(viewLayout);
        }
        return viewLayout.cimColorMap[cimId];
    };

    const toggleViewStyle = () => {
        if (viewLayout.viewStyle === ViewStyle.UML) {
            setViewLayout({ ...viewLayout, viewStyle: ViewStyle.ONTOGRAPHER });
        } else {
            setViewLayout({ ...viewLayout, viewStyle: ViewStyle.UML });
        }
    };

    const highlightElement = (cls: CimClass) => {
        setViewLayout({ ...viewLayout, highlitedElement: cls });
    };

    return { viewLayout, addClassToView, removeFromView, setPositionOf, colorOfCim, toggleViewStyle, highlightElement };
};
