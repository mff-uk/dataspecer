import {
    GraphConversionConstraint,
    AlgorithmConfiguration,
    DefaultGraphConversionConstraint,
    UserGivenAlgorithmConfigurationBase
} from "./constraints";
import { ElkConstraint } from "./elk/elk-constraints";

/**
 * Behaves like container for constraints of certain subgraph or whole graph. TODO: Maybe just the whole graph
 */
export class ConstraintContainer {
    // This are algorithm constraints for general group of nodes (type @{link AffectedNodesGroupingsType})
    // This is object for 2 reasons (but maybe we will switch it to array anyways, the issue with array is that order matters):
    //             1) We can have classic algorithm constraints on min node dist and then another constraint on interactivity in term of the Algorithm parameters
    //               (we have stack it together using concat but that is detail)
    //             2) Since the whole class is container it should also contain the algorithm constraints for subgraphs (like generalization for example), in case if we want it
    // TODO: In future maybe array since the AlgorithmOnlyConstraint already has attribute with AffectedNodesGroupingsType
    /**
     * Represents the actions used to transform and layout graph -
     *    Layout - min distance between nodes, type of algorithm, etc.
     *    Conversion - create generalization subgraph
     * The actions are in sequential order as how they should be called - they are transformed from user given configuration to
     * to more specific actions instead of the more general ones given from user
     * Different graph layouting libraries (for example for Elk {@link ElkConstraint}) can override this for more specific type in the values of Record.
     */
    layoutActions: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionConstraint)[];

    /**
     * Are the actions which run before the main layouting algorithm.
     */
    layoutActionsToRunBefore: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionConstraint)[];

    /**
     * Is the current index of the generator for the {@link layoutActionsIterator}
     */
    currentStepInLayoutActions: number;

    /**
     * Is generator contaning all the layout actions to be performed in the main loop
     */
    layoutActionsIterator: Generator<AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionConstraint>;


    /**
     * Is the current index of the generator for the {@link layoutActionsIteratorBefore}
     */
    currentStepInLayoutActionsToRunBefore: number;

    /**
     * Is generator contaning all the layout actions to be performed before running the main layout algorithm
     */
    layoutActionsIteratorBefore: Generator<AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionConstraint>;

    /**
     * Represents the currently iterated layout action
     */
    currentLayoutAction: {
        isInActionsBefore: boolean,
        action: AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionConstraint,
    };

    /**
     * How many times should the algorithm run, i.e. from how many runs to choose the best one based on metrics
     */
    numberOfAlgorithmRuns: number;


    constructor(
        layoutActionsBefore: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionConstraint)[],
        layoutActions: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionConstraint)[],
        numberOfAlgorithmRuns: number,
    ) {
        this.layoutActionsToRunBefore = layoutActionsBefore;
        this.resetLayoutActionsBeforeRunIterator();
        this.resetLayoutActionsIterator();

        this.numberOfAlgorithmRuns = numberOfAlgorithmRuns;
        this.layoutActions = [];
        this.addAlgorithmConstraints(...layoutActions);
    }

    /**
     * Adds new algorithm constraints to the list of internal algorithm constraints
     * @param constraints
     */
    addAlgorithmConstraints(...constraints: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionConstraint)[]) {
        constraints.forEach(constraint => {
            if(constraint === null) {
                return;
            }

            this.addAlgorithmConstraint(constraint, this.layoutActions.length);
        });
    }
    addAlgorithmConstraint(constraint: AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionConstraint, position?: number) {
        if(position === undefined) {
            position = this.layoutActions.length;
        }
        this.layoutActions.splice(position, 0, constraint);
    }



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
                if((currentLayoutAction instanceof DefaultGraphConversionConstraint) && currentLayoutAction.actionName === "CREATE_GENERALIZATION_SUBGRAPHS") {
                    return true;
                }
            }
        }
        else {
            for(const currentLayoutAction of this.layoutActionsToRunBefore) {
                if((currentLayoutAction instanceof DefaultGraphConversionConstraint) && currentLayoutAction.actionName === "CREATE_GENERALIZATION_SUBGRAPHS") {
                    return true;
                }
            }

            for(let i = 0; i < this.currentStepInLayoutActions; i++) {
                const currentLayoutAction = this.layoutActions[i];
                if((currentLayoutAction instanceof DefaultGraphConversionConstraint) && currentLayoutAction.actionName === "CREATE_GENERALIZATION_SUBGRAPHS") {
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
    layoutActionsToRunBefore: ((AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> & ElkConstraint) | GraphConversionConstraint)[] = [];
    layoutActions: ((AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> & ElkConstraint) | GraphConversionConstraint)[] = [];
    currentLayoutAction: {
        isInActionsBefore: boolean,
        action: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> & ElkConstraint) | GraphConversionConstraint,
    } | null = null;
}


