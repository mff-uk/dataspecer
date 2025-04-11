import { AlgorithmConfiguration } from "./algorithm-configurations";
import {
    DefaultGraphConversionActionConfiguration,
    GraphConversionActionConfiguration,
} from "./graph-conversion-action";
import { ElkConfiguration } from "./elk/elk-configurations";
import { UserGivenAlgorithmConfigurationBase } from "./user-algorithm-configurations";

/**
 * Behaves like container for configurations for graph layout.
 */
export class ConfigurationsContainer {
    /**
     * Represents the actions used to transform and layout graph -
     *    Layout - min distance between nodes, type of algorithm, etc.
     *    Conversion - create generalization subgraph
     * The actions are in sequential order as how they should be called - they are transformed from user given configuration to
     * to more specific actions instead of the more general ones given from user
     * Different graph layouting libraries (for example for Elk {@link ElkConfiguration}) can override this for more specific type in the values of Record.
     */
    layoutActions: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionActionConfiguration)[];

    /**
     * Are the actions which run before the main layouting algorithm.
     */
    layoutActionsToRunBefore: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionActionConfiguration)[];

    /**
     * Is the current index of the generator for the {@link layoutActionsIterator}
     */
    currentStepInLayoutActions: number;

    /**
     * Is generator contaning all the layout actions to be performed in the main loop
     */
    layoutActionsIterator: Generator<AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionActionConfiguration>;


    /**
     * Is the current index of the generator for the {@link layoutActionsIteratorBefore}
     */
    currentStepInLayoutActionsToRunBefore: number;

    /**
     * Is generator contaning all the layout actions to be performed before running the main layout algorithm
     */
    layoutActionsIteratorBefore: Generator<AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionActionConfiguration>;

    /**
     * Represents the currently iterated layout action
     */
    currentLayoutAction: {
        isInActionsBefore: boolean,
        action: AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionActionConfiguration,
    };

    /**
     * How many times should the algorithm run, i.e. from how many runs to choose the best one based on metrics
     */
    numberOfAlgorithmRuns: number;


    constructor(
        layoutActionsBefore: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionActionConfiguration)[],
        layoutActions: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionActionConfiguration)[],
        numberOfAlgorithmRuns: number,
    ) {
        this.layoutActionsToRunBefore = layoutActionsBefore;
        this.resetLayoutActionsBeforeRunIterator();
        this.resetLayoutActionsIterator();

        this.numberOfAlgorithmRuns = numberOfAlgorithmRuns;
        this.layoutActions = [];
        this.addAlgorithmConfigurations(...layoutActions);
    }

    /**
     * Adds new algorithm user given algorithm configurations and Graph conversion actions to the list of internal algorithm actions
     */
    addAlgorithmConfigurations(...configurations: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionActionConfiguration)[]) {
        configurations.forEach(configuration => {
            if(configuration === null) {
                return;
            }

            this.addAlgorithmConfiguration(configuration, this.layoutActions.length);
        });
    }
    addAlgorithmConfiguration(configuration: AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> | GraphConversionActionConfiguration, position?: number) {
        if(position === undefined) {
            position = this.layoutActions.length;
        }
        this.layoutActions.splice(position, 0, configuration);
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
                if((currentLayoutAction instanceof DefaultGraphConversionActionConfiguration) && currentLayoutAction.actionName === "CREATE_GENERALIZATION_SUBGRAPHS") {
                    return true;
                }
            }
        }
        else {
            for(const currentLayoutAction of this.layoutActionsToRunBefore) {
                if((currentLayoutAction instanceof DefaultGraphConversionActionConfiguration) && currentLayoutAction.actionName === "CREATE_GENERALIZATION_SUBGRAPHS") {
                    return true;
                }
            }

            for(let i = 0; i < this.currentStepInLayoutActions; i++) {
                const currentLayoutAction = this.layoutActions[i];
                if((currentLayoutAction instanceof DefaultGraphConversionActionConfiguration) && currentLayoutAction.actionName === "CREATE_GENERALIZATION_SUBGRAPHS") {
                    return true;
                }
            }
        }

        return false;
    }
}

/**
 * Configuration container for the Elk graph library. Extends {@link ConfigurationsContainer} by being more specific about types of the algorithm configurations.
 */
export class ElkConfigurationsContainer extends ConfigurationsContainer {
    layoutActionsToRunBefore: ((AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> & ElkConfiguration) | GraphConversionActionConfiguration)[] = [];
    layoutActions: ((AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> & ElkConfiguration) | GraphConversionActionConfiguration)[] = [];
    currentLayoutAction: {
        isInActionsBefore: boolean,
        action: (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> & ElkConfiguration) | GraphConversionActionConfiguration,
    } | null = null;
}


