import { NodeDimensionQueryHandler } from "..";
import { INodeClassic } from "../graph/representation/graph";

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

    getWidth(_estimatedNode: INodeClassic): number {
        return ReactflowDimensionsConstantEstimator.getDefaultWidth();
    }

    getHeight(_estimatedNode: INodeClassic): number {
        return ReactflowDimensionsConstantEstimator.getDefaultHeight();
    }
}
