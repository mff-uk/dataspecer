import { NodeDimensionQueryHandler } from "..";
import { INodeClassic } from "../graph-iface";

/**
 * Simple dimension query handler, which returns constant values as estimation of node dimensions.
 */
export class ReactflowDimensionsConstantEstimator implements NodeDimensionQueryHandler {
    getWidth(estimatedNode: INodeClassic): number {
        return 400;
    }

    getHeight(estimatedNode: INodeClassic): number {
        return 64;
    }
}
