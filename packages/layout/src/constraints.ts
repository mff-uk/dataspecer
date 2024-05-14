import { LayoutOptions } from "elkjs";
import { IGraphClassic } from "./graph-iface"

// TODO: Will be hierarchic probably, type data property will depend on the costraint type (Like in the Elk example) - 
//       so it makes more sense to make it class maybe - not sure now
export interface IConstraint {
    constrainedSubgraph: IGraphClassic;
    data: object;
}

export interface IConstraintSimple {
    constraintedNodes: "ALL" | "GENERALIZATION" | "PROFILE";
    data: object;
}

interface ElkConstraintTODO extends IConstraintSimple {
    data: LayoutOptions;
}
