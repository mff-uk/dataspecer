import { Edge } from "../../representation/edge";
import { DefaultGraph, Graph } from "../../representation/graph";
import { VisualNodeComplete } from "../../representation/node";
import { AllMetricData, ComputedMetricValues, Metric } from "../graph-metric";
import { EdgeCrossingMetric } from "./edge-crossing";

/**
 * Computes the crosses between nodes and edges
 */
export class EdgeNodeCrossingMetric implements Metric {
    computeMetric(graph: Graph): ComputedMetricValues {
        let edgeNodeCrossingCount: number = 0;
        const nodes = Object.values(graph.nodes);
        nodes.forEach(n => {
            for(let outN of n.getAllOutgoingEdges()) {
                nodes.forEach(possibleCollisionNode => {
                    if(possibleCollisionNode === n || possibleCollisionNode === outN.end) {
                        return;
                    }
                    edgeNodeCrossingCount += EdgeNodeCrossingMetric.isLineRectangleCollision(outN, possibleCollisionNode.completeVisualNode);
                });
            }
        });

        const maxPossibleCrossingCount = (nodes.length - 2) * graph.mainGraph.getAllEdgesInMainGraph().length;
        if(maxPossibleCrossingCount === 0) {
            return {
                absoluteValue: 0,
                relativeValue: 1,
            };
        }

        return {
            absoluteValue: edgeNodeCrossingCount,
            relativeValue: 1 - (edgeNodeCrossingCount / maxPossibleCrossingCount),
        };
    }



    // Based on https://www.jeffreythompson.org/collision-detection/line-rect.php

    public static isLineRectangleCollision(line: Edge, rectangle: VisualNodeComplete): 0 | 1 {
        const start = EdgeCrossingMetric.getMiddle(line.start.completeVisualNode);
        const end = EdgeCrossingMetric.getMiddle(line.end.completeVisualNode);


        return EdgeNodeCrossingMetric.isLineRectangleCollisionInternal(start.x, start.y, end.x, end.y,
                                                                        rectangle.coreVisualNode.position.x, rectangle.coreVisualNode.position.y,
                                                                        rectangle.width, rectangle.height) === true ? 1 : 0;
    }


    static isLineRectangleCollisionInternal(x1: number, y1: number, x2: number, y2: number, rx: number, ry: number, rw: number, rh: number): boolean {

        // check if the line has hit any of the rectangle's sides
        // uses the Line/Line function below
        const isLeftSideCollision = EdgeNodeCrossingMetric.isLineLineCollision(x1,y1,x2,y2, rx,ry,rx, ry+rh);
        const isRightSideCollision = EdgeNodeCrossingMetric.isLineLineCollision(x1,y1,x2,y2, rx+rw,ry, rx+rw,ry+rh);
        const isTopSideCollision = EdgeNodeCrossingMetric.isLineLineCollision(x1,y1,x2,y2, rx,ry, rx+rw,ry);
        const isBottomSideCollision = EdgeNodeCrossingMetric.isLineLineCollision(x1,y1,x2,y2, rx,ry+rh, rx+rw,ry+rh);

        const isInsideRectangle = x1 > rx && x1 < rx + rw && y1 > ry && y1 < ry + rh;

        // if ANY of the above are true, the line
        // has hit the rectangle
        if (isLeftSideCollision || isRightSideCollision || isTopSideCollision || isBottomSideCollision || isInsideRectangle) {
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

    computeMetricForNodes(graph: Graph): Record<string, ComputedMetricValues> {
        throw new Error("Method not implemented.");
    }
    computeMetricForEdges(graph: Graph): Record<string, ComputedMetricValues> {
        throw new Error("Method not implemented.");
    }
    computeMetricsForEverything(graph: Graph): AllMetricData {
        throw new Error("Method not implemented.");
    }

}
