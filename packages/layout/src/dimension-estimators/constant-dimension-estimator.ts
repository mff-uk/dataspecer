import { NodeDimensionQueryHandler } from "..";
import { INodeClassic } from "../graph-iface";

/**
 * Simple dimension query handler, which returns constant values as estimation of node dimensions.
 */
export class ReactflowDimensionsConstantEstimator implements NodeDimensionQueryHandler {
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
