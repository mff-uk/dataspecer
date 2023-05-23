import type { Cim, CimClass } from "../model/cim-defs";
import { getRandomName, getRandomPosition } from "../../utils/random-gen";

export enum ViewStyle {
    UML = "UML",
    ONTOGRAPHER = "ONTOGRAPHER", // FIXME: what's the proper name?
}

export type Position = {
    x: number;
    y: number;
};

export type ViewLayoutProps = {
    id: string; // id of view layout,
    elementPositionMapWithClassRef?: Map<CimClass, Position>; // [elementId, position]
    paperSize?: Position;
    cimColorMap?: Record<string, string>;
    viewStyle: ViewStyle;
};

export type ViewLayout2 = {
    id: string;
    elementPositionMapWithClassRef: Map<CimClass, Position>; // [elementId, position]
    paperSize: Position;
    cimColorMap: Record<string, string>;
    viewStyle: ViewStyle;
    highlitedElement?: CimClass;
};

export const getRandomViewLayoutFor = (paperSize: Position, ...cims: Cim[]) => {
    const elementPosMap = new Map<CimClass, Position>();

    const someClasses: CimClass[] = cims.map((c) => c.classes).flat();
    // .filter((c, i) => i % 10 === 0); // randomly choose cimClasses to be part of this view;

    someClasses.forEach((c) => {
        const randomPos = getRandomPosition(paperSize.x - 80, paperSize.y - 90); // todo: fix magic constants, to make classes visible
        elementPosMap.set(c, randomPos);
    });

    const colors = ["powderblue", "mistyrose", "seashell", "lavenderblush"];

    const colorMap = {} as Record<string, string>;
    cims.forEach((c, i) => {
        colorMap[c.id] = colors[i] ?? "lightgray";
    });

    return {
        id: getRandomName(),
        elementPositionMapWithClassRef: elementPosMap,
        paperSize: paperSize,
        cimColorMap: colorMap,
        viewStyle: ViewStyle.UML,
    } as ViewLayout2;
};
