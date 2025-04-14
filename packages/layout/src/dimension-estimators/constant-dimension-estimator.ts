import { NodeDimensionQueryHandler } from "../index.ts";
import { INodeClassic } from "../graph-iface.ts";

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

    getWidth(estimatedNode: INodeClassic): number {
        return ReactflowDimensionsConstantEstimator.getDefaultWidth();
    }

    getHeight(estimatedNode: INodeClassic): number {
        return ReactflowDimensionsConstantEstimator.getDefaultHeight();
    }
}
