export type Position = {
    x: number;
    y: number;
};

export interface VisualEntity {
    id: string;
    type: string[];
    sourceEntityId: string;
    visible: boolean;
    position: Position;
    hiddenAttributes: string[];
}

export type VisualEntities = Record<string, VisualEntity>;
