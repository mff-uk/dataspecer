import React, { useContext } from "react";
import { getRandomName, getRandomPosition } from "../utils/random-gen";
import { PimClass } from "@dataspecer/core/pim/model";
import { CimAdapter } from "@dataspecer/core/cim";

export type Position = { x: number; y: number };

export type ViewLayout = {
    id: string;
    elementPositionMap: Map<PimClass, Position>; // [pimClass.iri, position]
    elementColorMap: Map<PimClass, string>; // FIXME: just temporary until we figure out how to get pimClass's color
    paperSize: Position;
    cimColorMap: Record<string, string>;
    colorMap: Map<CimAdapter, string>;
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

    const addClassToView2 = (cls: PimClass, cim: CimAdapter) => {
        viewLayout.elementPositionMap.set(cls, getRandomPosition(viewLayout.paperSize.x, viewLayout.paperSize.y));
        viewLayout.elementColorMap.set(cls, cimColor(cim));
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

    /** @deprecated use 'cimColor' instead
     */
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

    const colorOfClass = (pimClass: PimClass) => {
        return viewLayout.elementColorMap.get(pimClass) ?? "bg-red-500"; // FIXME: make better coloring system
    };

    const cimColor = (cimAdapter: CimAdapter) => {
        return viewLayout.colorMap.get(cimAdapter) ?? "bg-red-500"; // FIXME: make better coloring system
    };

    const highlightElement = (cls: PimClass) => {
        setViewLayout({ ...viewLayout, highlitedElement: cls });
    };

    return {
        viewLayout,
        addClassToView,
        addClassToView2,
        removeFromView,
        setPositionOf,
        colorOfCim,
        cimColor,
        colorOfClass,
        highlightElement,
    };
};

export const getRandomViewLayoutFor = (paperSize: Position, cims: CimAdapter[]) => {
    const colors = ["bg-lime-500", "bg-amber-400", "bg-purple-400", "bg-sky-500"]; // FIXME: make better coloring system
    const colorMap = new Map(cims.map((cim, index) => [cim, colors[index] ?? "bg-teal-400"]));

    return {
        id: getRandomName(),
        elementPositionMap: new Map<PimClass, Position>(),
        elementColorMap: new Map<PimClass, string>(),
        paperSize: paperSize,
        colorMap: colorMap,
    } as ViewLayout;
};
