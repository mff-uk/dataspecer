import { Cim, CimClass } from "../model/cim-defs";
import { getRandomName, getRandomNumberInRange, getRandomPosition } from "../utils/random-gen";
import { Position } from "./cim-layout";

export type ViewLayoutProps = {
    id: string; // id of view layout,
    elementPositionMap?: Record<string, Position>; // [elementId, position]
    elementPositionMapWithClassRef?: Map<CimClass, Position>; // [elementId, position]
    paperSize?: Position;
    cimColorMap?: Record<string, string>;
};

export class ViewLayout {
    id: string;
    elementPositionMap: Record<string, Position>;
    elementPositionMapWithClassRef: Map<CimClass, Position>; // [elementId, position]
    paperSize: Position;
    cimColorMap: Record<string, string>;

    constructor({
        id,
        elementPositionMap = {} as Record<string, Position>,
        elementPositionMapWithClassRef = new Map<CimClass, Position>(),
        paperSize = { x: 1500, y: 700 },
        cimColorMap = {} as Record<string, string>,
    }: ViewLayoutProps) {
        this.id = id;
        this.elementPositionMap = elementPositionMap;
        this.elementPositionMapWithClassRef = elementPositionMapWithClassRef;
        this.paperSize = paperSize;
        this.cimColorMap = cimColorMap;
    }

    positionOf(classId: string): Position | undefined {
        return this.elementPositionMap[classId];
    }

    setPosition(classId: string, position: Position) {
        this.elementPositionMap[classId] = position;
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
}

export const getRandomViewLayoutFor = (paperSize: Position, ...cims: Cim[]) => {
    const elementRecord = {} as Record<string, Position>;
    const elementPosMap = new Map<CimClass, Position>();

    const someClasses: CimClass[] = cims
        .map((c) => c.classes)
        .flat()
        .filter((c, i) => i % 2 === 0); // randomly choose cimClasses to be part of this view;

    someClasses.forEach((c) => {
        const randomPos = getRandomPosition(paperSize.x, paperSize.y);
        elementRecord[c.id] = randomPos;
        elementPosMap.set(c, randomPos);
    });

    const colors = ["powderblue", "mistyrose", "seashell", "lavenderblush"];

    const colorMap = {} as Record<string, string>;
    cims.forEach((c, i) => {
        colorMap[c.id] = colors[i]!;
    });

    console.log(someClasses);
    console.log(elementPosMap);

    return new ViewLayout({
        id: getRandomName(),
        elementPositionMap: elementRecord,
        elementPositionMapWithClassRef: elementPosMap,
        paperSize: paperSize,
        cimColorMap: colorMap,
    });
};
