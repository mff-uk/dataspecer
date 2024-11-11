import { LayoutMethod } from "../layout-iface";
import { ConstraintContainer } from "./constraint-container";
import { AlgorithmConfiguration, IGraphConversionConstraint, IAlgorithmConfiguration, IAlgorithmOnlyConstraint, IConstraintSimple, UserGivenAlgorithmConfiguration, UserGivenAlgorithmConfigurationslVersion2, UserGivenAlgorithmConfigurationslVersion4, GraphConversionConstraint, RandomConfiguration, getDefaultUserGivenConstraintsVersion4, AlgorithmPhases } from "./constraints";
import { D3ForceConfiguration } from "./d3js/d3-constraints";
import { ElkForceConfiguration, ElkLayeredConfiguration, ElkRadialConfiguration, ElkSporeConfiguration, ElkStressConfiguration } from "./elk/elk-constraints";


/**
 * This factory class takes care of creating constraints based on given configuration
 */
class AlgorithmConstraintFactory {
    static getLayoutMethodForAlgorithmConstraint(algConstraint: AlgorithmConfiguration): LayoutMethod {
        if(algConstraint instanceof ElkStressConfiguration) {
            throw new Error("Not implemented - Should return the layout method for Elk Stress algorithm");
        }
        else {
            throw new Error("Not implemented - Define for the rest of the Algorithms");
        }
    }


    private static getRandomLayoutConfiguration(userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration,
                                                shouldCreateNewGraph: boolean,
                                                algorithmPhasesToCall?: AlgorithmPhases): IAlgorithmConfiguration {

        return new RandomConfiguration(userGivenAlgorithmConfiguration.constraintedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
    }

    static addAlgorithmConfiguration(userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration,
                                        layoutActions: (IAlgorithmConfiguration | IGraphConversionConstraint)[],
                                        shouldCreateNewGraph: boolean): void {
        if(!userGivenAlgorithmConfiguration.should_be_considered) {
            return null;
        }
        switch(userGivenAlgorithmConfiguration.layout_alg) {
            case "elk_stress":
                const elkStress = new ElkStressConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph);
                if(userGivenAlgorithmConfiguration.number_of_new_algorithm_runs > 1) {
                    layoutActions.push(AlgorithmConstraintFactory.getRandomLayoutConfiguration(userGivenAlgorithmConfiguration, true));
                    elkStress.addAlgorithmConstraint("interactive", "true");
                }
                layoutActions.push(elkStress);
                break;
            case "elk_layered":
                layoutActions.push(new ElkLayeredConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "elk_force":
                if(userGivenAlgorithmConfiguration.number_of_new_algorithm_runs > 1) {
                    layoutActions.push(new ElkForceConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph, "ONLY-RUN"));
                }
                else {
                    layoutActions.push(new ElkForceConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                }
                break;
            case "random":
                layoutActions.push(AlgorithmConstraintFactory.getRandomLayoutConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "d3_force":
                layoutActions.push(new D3ForceConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "sporeCompaction":
                layoutActions.push(new ElkSporeConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "elk_radial":
                layoutActions.push(GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("TREEIFY"));
                layoutActions.push(new ElkRadialConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            default:
                throw new Error("Implementation error You forgot to extend the AlgorithmConstraintFactory factory for new algorithm");
        }

        if(userGivenAlgorithmConfiguration.run_layered_after) {
            const configLayeredAfter = getDefaultUserGivenConstraintsVersion4();
            configLayeredAfter.chosenMainAlgorithm = "elk_layered";
            configLayeredAfter.main.elk_layered.interactive = true;
            configLayeredAfter.main.elk_layered.constraintedNodes = userGivenAlgorithmConfiguration.constraintedNodes;
            this.addAlgorithmConfiguration(configLayeredAfter.main.elk_layered, layoutActions, false);
        }
    }


    static createSimpleConstraintsFromConfiguration(userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration): IConstraintSimple[] | null {
        if(!userGivenAlgorithmConfiguration.should_be_considered) {
            return null;
        }

        const result: IConstraintSimple[] = [];

        // TODO: I currently also have to check the type, because there is one state for all algorithms so when I change the algorithm type I still have the data from the old one
        //       in this case I can for example have number_of_new_algorithm_runs > 1 for layered algorithm, which isn't what I want, since it is deterministic
        if(userGivenAlgorithmConfiguration.number_of_new_algorithm_runs > 1 &&
            (userGivenAlgorithmConfiguration.layout_alg === "elk_stress" || userGivenAlgorithmConfiguration.layout_alg === "elk_force" )) {
            const numberOfAlgorithmRunsConstraint: IConstraintSimple = {
                constraintedNodes: "ALL",
                type: "control-flow-change",
                constraintTime: "IN-MAIN",
                name: "Best layout iteration count",
                data: { numberOfAlgorithmRuns: userGivenAlgorithmConfiguration.number_of_new_algorithm_runs }
            };
            result.push(numberOfAlgorithmRunsConstraint)
        }

        Object.entries(userGivenAlgorithmConfiguration).forEach(([key, value]) => {
            if(key === "run_layered_after" && value === true) {
                const runLayeredAfterConstraint: IConstraintSimple = {
                    constraintedNodes: "ALL",
                    type: "control-flow-change",
                    constraintTime: "POST-MAIN",
                    name: "Run layered after",
                    data: { runLayeredAfter: userGivenAlgorithmConfiguration.run_layered_after }
                };

                result.push(runLayeredAfterConstraint);
            }
        });

        return result
    }
}


/**
 * Class with static methods to create {@link ConstraintContainer}s
 */
export class ConstraintFactory {
    /**
     *
     * @param config
     * @returns {@link ConstraintContainer} for the whole graph based on given {@link config}.
     */
    static createConstraints(config: UserGivenAlgorithmConfigurationslVersion4): ConstraintContainer {
        const layoutActionsBeforeMainRun: (IAlgorithmConfiguration | IGraphConversionConstraint)[] = [];
        const layoutActions: (IAlgorithmConfiguration | IGraphConversionConstraint)[] = [];

        // TODO: Should be defined elsewhere
        if(config.general.elk_layered.should_be_considered) {
            const convertGeneralizationSubgraphs = GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("CREATE_GENERALIZATION_SUBGRAPHS");
            layoutActionsBeforeMainRun.push(convertGeneralizationSubgraphs);
        }
        // TODO: Not using the config.mainStepNumber and config.generalStepNumber, but that is only for future proofing anyways
        AlgorithmConstraintFactory.addAlgorithmConfiguration(config.general.elk_layered, layoutActionsBeforeMainRun, true);


        // We can't both have interactive layout and perform search for best algorithm
        // TODO: So just a bit of a hack now, to use only 1 run in such case and then set it back to original value so dialog doesn't change on reopen
        const originalNumberOfNewAlgorithmRuns = config.main[config.chosenMainAlgorithm].number_of_new_algorithm_runs;
        if(config.main[config.chosenMainAlgorithm].interactive === true) {
            config.main[config.chosenMainAlgorithm].number_of_new_algorithm_runs = 1;
        }

        // TODO: Maybe could be put into the addAlgorithmConfiguration method so it is all in one place
        if(config.chosenMainAlgorithm === "elk_force") {
            layoutActionsBeforeMainRun.push(new ElkForceConfiguration(config.main[config.chosenMainAlgorithm], true, "ONLY-PREPARE"));
        }
        AlgorithmConstraintFactory.addAlgorithmConfiguration(config.main[config.chosenMainAlgorithm], layoutActions, false);

        const simpleConstraints = AlgorithmConstraintFactory.createSimpleConstraintsFromConfiguration(config.main[config.chosenMainAlgorithm]);
        const constraintContainer = new ConstraintContainer(layoutActionsBeforeMainRun, layoutActions, simpleConstraints, undefined, undefined);


        config.main[config.chosenMainAlgorithm].number_of_new_algorithm_runs = originalNumberOfNewAlgorithmRuns;

        return constraintContainer
    }
}
