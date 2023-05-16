import type { Cim, CimClass } from "../model/cim-defs";
import { getRandomName, getRandomPosition } from "../utils/random-gen";
import type { Position } from "./cim-layout";

export enum ViewStyle {
    UML = "UML",
    ONTOGRAPHER = "ONTOGRAPHER", // FIXME: what's the proper name?
}

export type ViewLayoutProps = {
    id: string; // id of view layout,
    elementPositionMapWithClassRef?: Map<CimClass, Position>; // [elementId, position]
    paperSize?: Position;
    cimColorMap?: Record<string, string>;
    viewStyle: ViewStyle;
};

export class ViewLayout {
    id: string;
    elementPositionMapWithClassRef: Map<CimClass, Position>; // [elementId, position]
    paperSize: Position;
    cimColorMap: Record<string, string>;
    viewStyle: ViewStyle;

    constructor({
        id,
        elementPositionMapWithClassRef = new Map<CimClass, Position>(),
        paperSize = { x: 1500, y: 600 },
        cimColorMap = {} as Record<string, string>,
        viewStyle = ViewStyle.UML,
    }: ViewLayoutProps) {
        this.id = id;
        this.elementPositionMapWithClassRef = elementPositionMapWithClassRef;
        this.paperSize = paperSize;
        this.cimColorMap = cimColorMap;
        this.viewStyle = viewStyle;
    }

    setPositionWithRef(cls: CimClass, position: Position) {
        this.elementPositionMapWithClassRef.set(cls, position);
    }

    colorOfCim(cimId: string) {
        const color = this.cimColorMap[cimId];
        if (!color) {
            const newColor = "lightyellow";
            console.log("Color of cim[" + cimId + "] not defined, gonna make it " + newColor);
            this.cimColorMap[cimId] = newColor;
        }
        return this.cimColorMap[cimId];
    }

    addClassToView(cls: CimClass) {
        this.elementPositionMapWithClassRef.set(cls, getRandomPosition(this.paperSize.x, this.paperSize.y));
        // this.elementsInView.push(cls);
    }

    removeClassFromView(cls: CimClass) {
        return this.elementPositionMapWithClassRef.delete(cls);
    }

    toggleViewStyle(): void {
        this.viewStyle = this.viewStyle === ViewStyle.UML ? ViewStyle.ONTOGRAPHER : ViewStyle.UML;
    }
}

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

    return new ViewLayout({
        id: getRandomName(),
        elementPositionMapWithClassRef: elementPosMap,
        paperSize: paperSize,
        cimColorMap: colorMap,
        viewStyle: ViewStyle.UML,
    });
};
