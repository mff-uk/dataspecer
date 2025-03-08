import { Position } from "@dataspecer/core-v2/visual-model";
import { EdgeEndPoint, GraphClassic, IEdgeClassic, IGraphClassic, IVisualNodeComplete } from "../../graph-iface";
import { AllMetricData, Metric } from "../graph-metrics-iface";
import { EdgeCrossingMetric } from "./edge-crossing";

export class EdgeNodeCrossingMetric implements Metric {
    computeMetric(graph: IGraphClassic): number {
        let edgeNodeCrossingCount: number = 0;
        const nodes = Object.values(graph.nodes);
        nodes.forEach(n => {
            for(let outN of n.getAllOutgoingEdges()) {
                nodes.forEach(possibleCollisionNode => {
                    if(possibleCollisionNode === n || possibleCollisionNode === outN.end) {
                        return;
                    }
                    edgeNodeCrossingCount += EdgeNodeCrossingMetric.isLineRectangleCollision(outN, possibleCollisionNode);
                });
            }
        });

        const maxPossibleCrossingCount = (nodes.length - 2) * graph.mainGraph.allEdges.length;
        return 1 - (edgeNodeCrossingCount / maxPossibleCrossingCount)
    }



    // Based on https://www.jeffreythompson.org/collision-detection/line-rect.php

    public static isLineRectangleCollision(line: IEdgeClassic, rectangle: EdgeEndPoint): 0 | 1 {
        const start = EdgeCrossingMetric.getMiddle(line.start.completeVisualNode);
        const end = EdgeCrossingMetric.getMiddle(line.end.completeVisualNode);

        const rectangleVisual = rectangle.completeVisualNode;

        return EdgeNodeCrossingMetric.isLineRectangleCollisionInternal(start.x, start.y, end.x, end.y,
                                                                        rectangleVisual.coreVisualNode.position.x, rectangleVisual.coreVisualNode.position.y,
                                                                        rectangleVisual.width, rectangleVisual.height) === true ? 1 : 0;
    }


    static isLineRectangleCollisionInternal(x1: number, y1: number, x2: number, y2: number, rx: number, ry: number, rw: number, rh: number): boolean {

        // check if the line has hit any of the rectangle's sides
        // uses the Line/Line function below
        const isLeftSideCollision = EdgeNodeCrossingMetric.isLineLineCollision(x1,y1,x2,y2, rx,ry,rx, ry+rh);
        const isRightSideCollision = EdgeNodeCrossingMetric.isLineLineCollision(x1,y1,x2,y2, rx+rw,ry, rx+rw,ry+rh);
        const isTopSideCollision = EdgeNodeCrossingMetric.isLineLineCollision(x1,y1,x2,y2, rx,ry, rx+rw,ry);
        const isBottomSideCollision = EdgeNodeCrossingMetric.isLineLineCollision(x1,y1,x2,y2, rx,ry+rh, rx+rw,ry+rh);

        // if ANY of the above are true, the line
        // has hit the rectangle
        if (isLeftSideCollision || isRightSideCollision || isTopSideCollision || isBottomSideCollision) {
            return true;
        }
        return false;
      }


      // LINE/LINE
      static isLineLineCollision(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): boolean {

        // calculate the direction of the lines
        const uA: number = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        const uB: number = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

        // if uA and uB are between 0-1, lines are colliding
        return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
      }

    computeMetricForNodes(graph: GraphClassic): Record<string, number> {
        throw new Error("Method not implemented.");
    }
    computeMetricForEdges(graph: GraphClassic): Record<string, number> {
        throw new Error("Method not implemented.");
    }
    computeMetricsForEverything(graph: GraphClassic): AllMetricData {
        throw new Error("Method not implemented.");
    }

}