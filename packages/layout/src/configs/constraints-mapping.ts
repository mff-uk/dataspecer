import { NodeDimensionQueryHandler } from "..";
import { IMainGraphClassic } from "../graph-iface";
import { compactify } from "./constraints-implementation";

// TODO: Will need some parameters in the mapped function
// TODO: Actually the dimensions from the NodeDimensionQueryHandler should already by passed to the graph
export const CONSTRAINT_MAP: Record<string, (graph: IMainGraphClassic, nodeDimensionQueryHandler: NodeDimensionQueryHandler) => Promise<void>> = {
    "Anchor constraint": async () => {},
    "post-compactify": compactify,
}
