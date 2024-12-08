import { NodeDimensionQueryHandler } from "..";
import { IMainGraphClassic } from "../graph-iface";
import { ConstraintContainer } from "./constraint-container";
import { compactify } from "./constraints-implementation";

// TODO: Will need some parameters in the mapped function
export const CONSTRAINT_MAP: Record<string, (graph: IMainGraphClassic, mainConstraintContainer: ConstraintContainer) => Promise<void>> = {
    "Anchor constraint": async () => {},
    "post-compactify": compactify,
}
