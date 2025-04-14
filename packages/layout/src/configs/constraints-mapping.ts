import { NodeDimensionQueryHandler } from "../index.ts";
import { IMainGraphClassic } from "../graph-iface.ts";
import { ConstraintContainer } from "./constraint-container.ts";
import { compactify } from "./constraints-implementation.ts";

// TODO: Will need some parameters in the mapped function
export const CONSTRAINT_MAP: Record<string, (graph: IMainGraphClassic, mainConstraintContainer: ConstraintContainer) => Promise<void>> = {
    "Anchor constraint": async () => {},
    "post-compactify": compactify,
}
