// TODO: Actually I don't really like the union here (we have to convert the string value back to the enum value, if we want to use Enum somewhere)

import { Position } from "@dataspecer/core-v2/visual-model";

// TODO: So maybe just do the classic ... type Direction = "UP" | "RIGHT" | "DOWN" | "LEFT";
export enum DIRECTION {
    UP = "UP",
    RIGHT = "RIGHT",
    DOWN = "DOWN",
    LEFT = "LEFT"
}

type PositionWithOptionalAnchor = {
    x: number,
    y: number,
    anchor?: true | null,
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


export const placeCoordinateOnGrid = (coordinate: number, grid: number): number => {
    const convertedPosition = coordinate - (coordinate % grid);
    return convertedPosition;
}

export const placePositionOnGrid = (position: PositionWithOptionalAnchor, gridX: number, gridY: number): void => {
    position.x = placeCoordinateOnGrid(position.x, gridX);
    position.y = placeCoordinateOnGrid(position.y, gridY);
}



/**
 * This class is used to create unique identifiers of dummy/phantom elements in graph.
 */
export class PhantomElementsFactory {
    static phantomNodeIndex: number = 0;
    static phantomEdgeIndex: number = 0;
    static createUniquePhanomNodeIdentifier(): string {
        const identifier = `phantomNode-${this.phantomNodeIndex}`;
        this.phantomNodeIndex++;

        return identifier;
    }

    /**
     * @deprecated In future will be probably different way to do it
     * @returns
     */
    static createUniqueGeneralizationSubgraphIdentifier(): string {
        const identifier = `subgraph-${this.phantomNodeIndex}`;
        this.phantomNodeIndex++;

        return identifier;
    }

    static createUniquePhanomEdgeIdentifier(): string {
        const identifier = `phantomEdge-${this.phantomEdgeIndex}`;
        this.phantomEdgeIndex++;

        return identifier;
    }

    static constructSplitID = (id: string, index: number): string => {
        return `SPLIT-${index}-${id}`;
    }

    static deconstructSplitID = (id: string): string => {
        return id.split("-").splice(2,).join("");
    }
}
