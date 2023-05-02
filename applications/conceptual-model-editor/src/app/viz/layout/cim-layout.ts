import { Cim } from "../model/cim-defs";
import { getRandomName, getRandomPosition } from "../utils/random-gen";

export type Position = {
    x: number;
    y: number;
};
export type CimLayoutProps = {
    id: string;
    elementPositionMap?: Record<string, Position>;
    paperSize?: Position;
};

export class CimLayout {
    id: string;
    elementPositionMap: Record<string, Position>;
    paperSize: Position;

    constructor({
        id,
        elementPositionMap = {} as Record<string, Position>,
        paperSize = { x: 1000, y: 7000 },
    }: CimLayoutProps) {
        this.id = id;
        this.elementPositionMap = elementPositionMap;
        this.paperSize = paperSize;
    }

    positionOf(classId: string): Position | undefined {
        return this.elementPositionMap[classId];
    }

    setPosition(classId: string, position: Position) {
        this.elementPositionMap[classId] = position;
    }
}

export const getCimLayoutSample = () => {
    const cimLayout = new CimLayout({
        id: "kljflkds",
        elementPositionMap: {
            classProduct: { x: 386, y: 252 },
            classQuantitativeValue: { x: 421, y: 44 },
            classStructuredValue: { x: 671, y: 355 },
            classThing: { x: 833, y: 166 },
            classVehicle: { x: 312, y: 447 },
        },
    });
    return cimLayout;
};

export const getRandomLayoutForCim = (cim: Cim, paperSize: Position = { x: 1800, y: 800 }) => {
    const elemeRecord = {} as Record<string, Position>;

    cim.classes.forEach((c) => {
        elemeRecord[c.id] = getRandomPosition(paperSize.x, paperSize.y);
    });

    return new CimLayout({
        id: getRandomName(),
        elementPositionMap: elemeRecord,
        paperSize: paperSize,
    });
};
