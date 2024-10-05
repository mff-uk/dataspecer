
import { dataTypeUriToName } from "@dataspecer/core-v2/semantic-model/datatypes";
import { ConstraintedNodesGroupingsType, IAlgorithmOnlyConstraint, IConstraint, IConstraintSimple, UserGivenConstraints } from "./constraints";
import { LayoutAlgorithm, LayoutMethod } from "../layout-iface";
import { ElkLayout } from "../elk-layouts";
import { RandomLayout } from "../basic-layouts";
import { ElkConstraint } from "./elk/elk-constraints";

export type AlgorithmName = "elk_stress" | "elk_layered" | "elk_force" | "random" | "d3_force";

export const ALGORITHM_NAME_TO_LAYOUT_MAPPING: Record<AlgorithmName, LayoutAlgorithm> = {
    "elk_stress": new ElkLayout(),
    "elk_layered": new ElkLayout(),
    "elk_force": new ElkLayout(),
    "random": new RandomLayout(),
    "d3_force": new ElkLayout(),    // TODO:
}

type ModelID = string;

// TODO: In general a lot of the things maybe should be arrays and the ConstraintContainer should be just object which holds the arrays and
//       maybe has some methods to remove duplicates, merge constraints and correctly order them for further processing
/**
 * Behaves like container for constraints of certain subgraph (or whole graph) represented by {@link modelID}.
 */
export class ConstraintContainer {


    // This are algorithm constraints for general group of nodes (type @{link ConstraintedNodes})
    // This is object for 2 reasons (but maybe we will switch it to array anyways, the issue with array is that order matters):
    //             1) We can have classic algorithm constraints on min node dist and then another constraint on interactivity in term of the Algorithm parameters
    //               (we have stack it together using concat but that is detail)
    //             2) Since the whole class is container it should also contain the algorithm constraints for subgraphs (like generalization for example), in case if we want it
    // TODO: In future maybe array since the IAlgorithmOnlyConstraint already has attribute with ConstraintedNodesGroupingsType
    /**
     * Represents the constraints on algorithm - min distance between nodes, type of algorithm, etc.
     * Different graph layouting libraries (for example for Elk {@link ElkConstraint}) can override this for more specific type in the values of Record.
     */
    algorithmOnlyConstraints: Record<ConstraintedNodesGroupingsType, IAlgorithmOnlyConstraint>;


    // TODO: In future maybe only array (and passes completely separately from ConstraintContainer) and IAlgorithmOnlyConstraints instead of ConstraintContainer
    underlyingModelsConstraints: Record<ModelID, ConstraintContainer>;


    // TODO: The modelID info is also in underlyingModelsConstraints and the constraint (simpleConstraints and constraints)
    //       have to check the container to know for which model they should be applied
    /**
     * The ID of the container for which are the constraints relevant. Null if it is whole model.
     */
    modelID: ModelID | null;


    /**
     * These are just basic constraints on group of nodes (again type @{link ConstraintedNodes}), which are not algorithmic
     */
    simpleConstraints: IConstraintSimple[];


    /**
     * These are constraints on concrete group of nodes (the concrete nodes are enumerated)
     */
    constraints: IConstraint[];



    constructor(algorithmOnlyConstraints: IAlgorithmOnlyConstraint[],
                simpleConstraints: IConstraintSimple[],
                constraints: IConstraint[],
                underlyingModelsConstraints: Record<ModelID, ConstraintContainer>) {
                    this.algorithmOnlyConstraints = {
                        "ALL": undefined,
                        "GENERALIZATION": undefined,
                        "PROFILE": undefined,
                    };
                    this.addAlgorithmConstraints(...algorithmOnlyConstraints);
                    this.simpleConstraints = simpleConstraints === undefined ? [] : simpleConstraints;
                    this.constraints = constraints === undefined ? [] : constraints;
                    this.underlyingModelsConstraints = underlyingModelsConstraints;

                    // TODO: For now
                    this.modelID = null;
                }


    addSimpleConstraints(...constraints: IConstraintSimple[]) {
        this.simpleConstraints = this.simpleConstraints.concat(constraints);
    }
    addConstraints(...constraints: IConstraint[]) {
        this.constraints = this.constraints.concat(constraints);
    }
    addAlgorithmConstraints(...constraints: IAlgorithmOnlyConstraint[]) {
        constraints.forEach(c => {
            if(c === undefined) {
                return;
            }
            this.algorithmOnlyConstraints[c.constraintedNodes] = {
                ...this.algorithmOnlyConstraints[c.constraintedNodes],
                ...c
            };
        });
    }
}

/**
 * Constraint container for the Elk graph library. Extends {@link ConstraintContainer} by being more specific about types of algorithmic constraints.
 */
export class ElkConstraintContainer extends ConstraintContainer {
    algorithmOnlyConstraints: Record<string, (IAlgorithmOnlyConstraint & ElkConstraint)> = {};
}