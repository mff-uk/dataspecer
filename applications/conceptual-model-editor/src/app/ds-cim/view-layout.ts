import React, { useContext, useState } from "react";
// import { type Position, type ViewLayout2 } from "../../layout/view-layout";
import { getRandomName, getRandomPosition } from "../utils/random-gen";
import { PimClass } from "@dataspecer/core/pim/model";
import { CimAdapter } from "@dataspecer/core/cim";

export type Position = { x: number; y: number };

export type ViewLayout = {
    id: string;
    elementPositionMap: Map<PimClass, Position>; // [pimClass.iri, position]
    paperSize: Position;
    cimColorMap: Record<string, string>;
    highlitedElement?: PimClass;
};

export type ViewLayoutContextType = {
    viewLayout: ViewLayout;
    setViewLayout: React.Dispatch<React.SetStateAction<ViewLayout>>;
};

export const ViewLayoutContext = React.createContext(null as unknown as ViewLayoutContextType);

export const useViewLayoutContext = () => {
    const { viewLayout, setViewLayout } = useContext(ViewLayoutContext);

    const addClassToView = (cls: PimClass) => {
        viewLayout.elementPositionMap.set(cls, getRandomPosition(viewLayout.paperSize.x, viewLayout.paperSize.y));
        setViewLayout({ ...viewLayout });
    };

    const removeFromView = (cls: PimClass) => {
        console.log("gonna remove from view", cls);

        const newViewLayout = viewLayout;
        if (newViewLayout.elementPositionMap.delete(cls)) {
            setViewLayout({ ...newViewLayout });
        }
    };

    const setPositionOf = (cls: PimClass, position: Position) => {
        setViewLayout({
            ...viewLayout,
            elementPositionMap: viewLayout.elementPositionMap.set(cls, position),
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

    const highlightElement = (cls: PimClass) => {
        setViewLayout({ ...viewLayout, highlitedElement: cls });
    };

    return { viewLayout, addClassToView, removeFromView, setPositionOf, colorOfCim, highlightElement };
};

export const getRandomViewLayoutFor = (paperSize: Position, cims: CimAdapter[]) => {
    return {
        id: getRandomName(),
        elementPositionMap: new Map<PimClass, Position>(),
        paperSize: paperSize,
    } as ViewLayout;
};
