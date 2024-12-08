
import { IGraphConversionConstraint, ConstraintedNodesGroupingsType, IAlgorithmConfiguration, IAlgorithmOnlyConstraint, IConstraint, IConstraintSimple, GraphConversionConstraint } from "./constraints";
import { LayoutAlgorithm } from "../layout-iface";
import { ElkLayout } from "../elk-layouts";
import { RandomLayout } from "../basic-layouts";
import { ElkConstraint } from "./elk/elk-constraints";

export type AlgorithmName = "elk_stress" | "elk_layered" | "elk_force" | "random" | "d3_force" | "sporeCompaction" | "elk_radial";

export const ALGORITHM_NAME_TO_LAYOUT_MAPPING: Record<AlgorithmName, LayoutAlgorithm> = {
    "elk_stress": new ElkLayout(),
    "elk_layered": new ElkLayout(),
    "elk_force": new ElkLayout(),
    "random": new RandomLayout(),
    "d3_force": new ElkLayout(),    // TODO:
    "sporeCompaction": new ElkLayout(),
    "elk_radial": new ElkLayout(),
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
     * Represents the actions used to transform and layout graph -
     *    Layout - min distance between nodes, type of algorithm, etc.
     *    Conversion - create generalization subgraph
     * The actions are in sequential order as how they should be called - they are transformed from user given configuration to
     * to more specific actions instead of the more general ones given from user
     * Different graph layouting libraries (for example for Elk {@link ElkConstraint}) can override this for more specific type in the values of Record.
     */
    layoutActions: (IAlgorithmConfiguration | IGraphConversionConstraint)[];

    // TODO: Add Docs
    layoutActionsToRunBefore: (IAlgorithmConfiguration | IGraphConversionConstraint)[];


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

    // TODO: Add Docs
    currentStepInLayoutActions: number;

    // TODO: Add Docs
    layoutActionsIterator: Generator<IAlgorithmConfiguration | IGraphConversionConstraint, void, unknown>;


    // TODO: Add Docs
    currentStepInLayoutActionsToRunBefore: number;

    // TODO: Add Docs
    layoutActionsIteratorBefore: Generator<IAlgorithmConfiguration | IGraphConversionConstraint, void, unknown>;

    // TODO: Add Docs
    currentLayoutAction: {
        isInActionsBefore: boolean,
        action: IAlgorithmConfiguration | IGraphConversionConstraint,
    };



    constructor(layoutActionsBefore: (IAlgorithmConfiguration | IGraphConversionConstraint)[],
                layoutActions: (IAlgorithmConfiguration | IGraphConversionConstraint)[],
                simpleConstraints?: IConstraintSimple[] | null,
                constraints?: IConstraint[] | null,
                underlyingModelsConstraints?: Record<ModelID, ConstraintContainer> | null) {
                    this.layoutActionsToRunBefore = layoutActionsBefore;
                    this.resetLayoutActionsBeforeRunIterator();
                    this.resetLayoutActionsIterator();

                    this.layoutActions = [];
                    this.addAlgorithmConstraints(...layoutActions);
                    this.simpleConstraints = simpleConstraints ?? [];
                    this.constraints = constraints ?? [];
                    this.underlyingModelsConstraints = underlyingModelsConstraints ?? {};

                    // TODO: For now
                    this.modelID = null;
                }


    addSimpleConstraints(...constraints: IConstraintSimple[]) {
        this.simpleConstraints = this.simpleConstraints.concat(constraints);
    }
    addConstraints(...constraints: IConstraint[]) {
        this.constraints = this.constraints.concat(constraints);
    }
    addAlgorithmConstraints(...constraints: (IAlgorithmConfiguration | IGraphConversionConstraint)[]) {
        constraints.forEach(constraint => {
            if(constraint === null) {
                return;
            }

            // TODO: Doesn't copy methods
            // this.algorithmOnlyConstraints[constraint.constraintedNodes] = {
            //     // ...this.algorithmOnlyConstraints[constraint.constraintedNodes],
            //     ...constraint
            // };
            this.addAlgorithmConstraint(constraint, this.layoutActions.length);
        });
    }
    addAlgorithmConstraint(constraint: IAlgorithmConfiguration | IGraphConversionConstraint, position?: number) {
        if(position === undefined) {
            position = this.layoutActions.length;
        }
        this.layoutActions.splice(position, 0, constraint);
    }


    // TODO: Add Docs
    resetLayoutActionsIterator() {
        this.layoutActionsIterator = this.createLayoutActionsIterator();
    }

    private *createLayoutActionsIterator() {
        this.currentStepInLayoutActions = 0;

        for(const layoutAction of this.layoutActions) {
            this.currentLayoutAction = {
                isInActionsBefore: true,
                action: layoutAction
            };
            yield layoutAction;
            this.currentStepInLayoutActions++;
        }
    }


    // TODO: Add Docs
    resetLayoutActionsBeforeRunIterator() {
        this.layoutActionsIteratorBefore = this.createLayoutActionsBeforeRunIterator();
    }

    private *createLayoutActionsBeforeRunIterator() {
        this.currentStepInLayoutActionsToRunBefore = 0;

        for(const layoutAction of this.layoutActionsToRunBefore) {
            this.currentLayoutAction = {
                isInActionsBefore: false,
                action: layoutAction
            };
            yield layoutAction;
            this.currentStepInLayoutActionsToRunBefore++;
        }
    }


    // TODO: Add Docs
    isGeneralizationPerformedBefore(): boolean {
        if(this.currentLayoutAction.isInActionsBefore) {
            for(let i = 0; i < this.currentStepInLayoutActionsToRunBefore; i++) {
                const currentLayoutAction = this.layoutActionsToRunBefore[i];
                if((currentLayoutAction instanceof GraphConversionConstraint) && currentLayoutAction.actionName === "CREATE_GENERALIZATION_SUBGRAPHS") {
                    return true;
                }
            }
        }
        else {
            for(const currentLayoutAction of this.layoutActionsToRunBefore) {
                if((currentLayoutAction instanceof GraphConversionConstraint) && currentLayoutAction.actionName === "CREATE_GENERALIZATION_SUBGRAPHS") {
                    return true;
                }
            }

            for(let i = 0; i < this.currentStepInLayoutActions; i++) {
                const currentLayoutAction = this.layoutActions[i];
                if((currentLayoutAction instanceof GraphConversionConstraint) && currentLayoutAction.actionName === "CREATE_GENERALIZATION_SUBGRAPHS") {
                    return true;
                }
            }
        }

        return false;
    }
}

/**
 * Constraint container for the Elk graph library. Extends {@link ConstraintContainer} by being more specific about types of algorithmic constraints.
 */
export class ElkConstraintContainer extends ConstraintContainer {
    layoutActionsToRunBefore: ((IAlgorithmConfiguration & ElkConstraint) | IGraphConversionConstraint)[] = [];
    layoutActions: ((IAlgorithmConfiguration & ElkConstraint) | IGraphConversionConstraint)[] = [];
    currentLayoutAction: {
        isInActionsBefore: boolean,
        action: (IAlgorithmConfiguration & ElkConstraint) | IGraphConversionConstraint,
    } | null = null;
}


