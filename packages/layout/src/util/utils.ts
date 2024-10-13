// TODO: Actually I don't really like the union here (we have to convert the string value back to the enum value, if we want to use Enum somewhere)
// TODO: So maybe just do the classic ... type Direction = "UP" | "RIGHT" | "DOWN" | "LEFT";
export enum DIRECTION {
    UP = "UP",
    RIGHT = "RIGHT",
    DOWN = "DOWN",
    LEFT = "LEFT"
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



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