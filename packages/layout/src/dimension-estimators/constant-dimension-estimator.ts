import { NodeDimensionQueryHandler } from "..";
import { INodeClassic } from "../graph-iface";

export class ReactflowDimensionsEstimator implements NodeDimensionQueryHandler {
    getWidth(estimatedNode: INodeClassic): number {
        return 400;
    }

    getHeight(estimatedNode: INodeClassic): number {
        return 64;
    }
}
