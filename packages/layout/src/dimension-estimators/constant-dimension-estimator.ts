import { NodeDimensionQueryHandler } from "../index.ts";
import { Node } from "../graph/representation/node.ts";

/**
 * Simple dimension query handler, which returns constant values as estimation of node dimensions.
 */
export class ReactflowDimensionsConstantEstimator implements NodeDimensionQueryHandler {
    static getMinimumWidth() {
        return 224;
    }

    static getDefaultWidth() {
        return 400;
    }

    static getDefaultHeight() {
        return 58;
    }

    getWidth(_estimatedNode: Node): number {
        return ReactflowDimensionsConstantEstimator.getDefaultWidth();
    }

    getHeight(_estimatedNode: Node): number {
        return ReactflowDimensionsConstantEstimator.getDefaultHeight();
    }
}
