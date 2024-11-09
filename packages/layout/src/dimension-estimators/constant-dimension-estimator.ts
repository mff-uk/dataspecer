import { NodeDimensionQueryHandler } from "..";
import { INodeClassic } from "../graph-iface";

/**
 * Simple dimension query handler, which returns constant values as estimation of node dimensions.
 */
export class ReactflowNodeDimensionsConstantEstimator implements NodeDimensionQueryHandler {
    static getDefaultWidth() {
        return 400;
    }

    static getDefaultHeight() {
        return 58;
    }

    getWidth(estimatedNode: INodeClassic): number {
        return ReactflowNodeDimensionsConstantEstimator.getDefaultWidth();
    }

    getHeight(estimatedNode: INodeClassic): number {
        return ReactflowNodeDimensionsConstantEstimator.getDefaultHeight();
    }
}
