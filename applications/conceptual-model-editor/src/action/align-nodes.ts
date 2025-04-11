import { isVisualNode, VisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { XY } from "@dataspecer/layout";
import { UseDiagramType } from "../diagram/diagram-hook";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { placeCoordinateOnGrid } from "../../../../packages/layout/lib/util/utils";
import { configuration } from "../application";

type AlignmentPosition = AlignmentHorizontalPosition | AlignmentVerticalPosition;
export enum AlignmentHorizontalPosition {
    Left,
    Mid,
    Right
}
export enum AlignmentVerticalPosition {
    Top,
    Mid,
    Bot
}

const getTopLeftPosition = (nodes: VisualNode[]) => {
    const topLeft = {x: 10000000, y: 10000000};
    nodes.forEach(node => {
        if(node.position.x < topLeft.x) {
            topLeft.x = node.position.x;
        }
        if(node.position.y < topLeft.y) {
            topLeft.y = node.position.y;
        }
    });

    return topLeft;
};


const getBotRightPosition = (
    diagram: UseDiagramType,
    nodes: VisualNode[]
) => {
    const botRight = {x: -10000000, y: -10000000};
    nodes.forEach(node => {
        const width = getDimensionValue(diagram, DimensionType.Width, node.identifier);
        const x = node.position.x + width;
        if(x > botRight.x) {
            botRight.x = x;
        }

        const height = getDimensionValue(diagram, DimensionType.Height, node.identifier);
        const y = node.position.y + height;
        if(y > botRight.y) {
            botRight.y = y;
        }
    });

    return botRight;
};

type BoundingBoxInfo = {
    topLeft: XY,
    mid: XY,
    botRight: XY,
}
const getBoundingBoxInfo = (
    diagram: UseDiagramType,
    nodes: VisualNode[]
): BoundingBoxInfo => {
    const topLeft = getTopLeftPosition(nodes);
    const botRight = getBotRightPosition(diagram, nodes);
    const mid = {
        x: (topLeft.x + botRight.x) / 2,
        y: (topLeft.y + botRight.y) / 2,
    };
    return {
        topLeft,
        mid,
        botRight
    };
};


type Coordinate = "x" | "y";
const getOtherCoordinate = (coordinate: Coordinate): Coordinate => {
    return coordinate === "x" ? "y" : "x";
};

enum DimensionType {
    Width,
    Height
};
const getRelevantDimensionForCoordinate = (coordinate: Coordinate): DimensionType => {
    return coordinate === "x" ? DimensionType.Width : DimensionType.Height;
};

/**
 * @returns Returns either width or height of node identified by {@link nodeIdentifier}.
 *  The returned dimension depends on {@link dimension}.
 */
function getDimensionValue(
    diagram: UseDiagramType,
    dimension: DimensionType,
    nodeIdentifier: string,
): number {
    const dimensionGetter = dimension === DimensionType.Width ?
        diagram.actions().getNodeWidth :
        diagram.actions().getNodeHeight;
    return dimensionGetter(nodeIdentifier) ?? 0;
}


/**
 * General method used for vertical and horizontal alignment, since they are almost the same, just with swapped coordinates
 */
function alignGeneral(
    notifications: UseNotificationServiceWriterType,
    diagram: UseDiagramType,
    visualModel: WritableVisualModel,
    identifiers: string[],
    alignmentPosition: AlignmentPosition,
    coordinateToChange: Coordinate
) {
    const nodes = [...visualModel.getVisualEntities().values()]
        .filter(entity => identifiers.includes(entity.identifier))
        .filter(isVisualNode);

    const coordinateToKeep = getOtherCoordinate(coordinateToChange);
    const dimensionForChangeCoordinate = getRelevantDimensionForCoordinate(coordinateToChange);
    const grid = coordinateToChange === "x" ? configuration().xSnapGrid : configuration().ySnapGrid;

    // Left === Top, Right === Bot ... we don't include it in the switch, since then compiler throws some warnings
    switch(alignmentPosition) {
        case AlignmentHorizontalPosition.Left: {
            const topLeft = getTopLeftPosition(nodes);
            nodes.forEach(node => {
                visualModel.updateVisualEntity(node.identifier, {
                    position: {
                        [coordinateToChange]: topLeft[coordinateToChange],
                        [coordinateToKeep]: node.position[coordinateToKeep]
                    } as XY
                });
            });
            break;
        }
        case AlignmentVerticalPosition.Mid: {
            const { mid } = getBoundingBoxInfo(diagram, nodes);
            nodes.forEach(node => {
                const changedDimensionValue = getDimensionValue(
                    diagram, dimensionForChangeCoordinate, node.identifier);
                visualModel.updateVisualEntity(node.identifier, {
                    position: {
                        [coordinateToChange]: placeCoordinateOnGrid(mid[coordinateToChange] - changedDimensionValue / 2, grid),
                        [coordinateToKeep]: node.position[coordinateToKeep]
                    } as XY
                });
            });

            break;
        }
        case AlignmentHorizontalPosition.Right: {
            const botRight = getBotRightPosition(diagram, nodes);
            nodes.forEach(node => {
                const changedDimensionValue = getDimensionValue(
                    diagram, dimensionForChangeCoordinate, node.identifier);
                visualModel.updateVisualEntity(node.identifier, {
                    position: {
                        [coordinateToChange]: placeCoordinateOnGrid(botRight[coordinateToChange] - changedDimensionValue, grid),
                        [coordinateToKeep]: node.position[coordinateToKeep]
                    } as XY
                });

            });

            break;
        }
        default:
            notifications.error("Invalid alignment position");
    }
};

/**
 * Updates visual model in such a way, that the nodes given in {@link identifiers} are aligned horizontally
 */
export function alignHorizontallyAction(
    notifications: UseNotificationServiceWriterType,
    diagram: UseDiagramType,
    visualModel: WritableVisualModel,
    identifiers: string[],
    alignmentPosition: AlignmentHorizontalPosition
) {
    alignGeneral(notifications, diagram, visualModel, identifiers, alignmentPosition, "x");
};

/**
 * Updates visual model in such a way, that the nodes given in {@link identifiers} are aligned vertically.
 */
export function alignVerticallyAction(
    notifications: UseNotificationServiceWriterType,
    diagram: UseDiagramType,
    visualModel: WritableVisualModel,
    identifiers: string[],
    alignmentPosition: AlignmentVerticalPosition
) {
    alignGeneral(notifications, diagram, visualModel, identifiers, alignmentPosition, "y");
};