import { LayoutMethod } from "../layout-iface";
import { ConstraintContainer } from "./constraint-container";
import { AlgorithmConfiguration, IAlgorithmConfiguration, IAlgorithmOnlyConstraint, IConstraintSimple, UserGivenAlgorithmConfiguration, UserGivenAlgorithmConfigurationslVersion2 } from "./constraints";
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

    static createAlgorithmConfiguration(userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration): IAlgorithmConfiguration | null {
        if(!userGivenAlgorithmConfiguration.should_be_considered) {
            return null;
        }
        switch(userGivenAlgorithmConfiguration.layout_alg) {
            case "elk_stress":
                return new ElkStressConfiguration(userGivenAlgorithmConfiguration);
            case "elk_layered":
                return new ElkLayeredConfiguration(userGivenAlgorithmConfiguration);
            case "elk_force":
                return new ElkForceConfiguration(userGivenAlgorithmConfiguration);
            case "random":
                return {
                    constraintedNodes: userGivenAlgorithmConfiguration.constraintedNodes,
                    algorithmName: "random",
                    type: "ALG",
                    constraintTime: "IN-MAIN",
                    name: "Random alg name",
                    data: undefined,
                    addAdvancedSettings: () => {},
                    addAdvancedSettingsForUnderlying: () => {},
                    addAlgorithmConstraint: () => {},
                    addAlgorithmConstraintForUnderlying: () => {},
                };
            case "d3_force":
                return new D3ForceConfiguration(userGivenAlgorithmConfiguration);
            case "sporeCompaction":
                return new ElkSporeConfiguration(userGivenAlgorithmConfiguration);
            case "elk_radial":
                return new ElkRadialConfiguration(userGivenAlgorithmConfiguration);
            default:
                throw new Error("Implementation error You forgot to extend the AlgorithmConstraintFactory factory for new algorithm");
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
    static createConstraints(config: UserGivenAlgorithmConfigurationslVersion2): ConstraintContainer {
        // TODO: For now, just take it directly, but could also iterate and look for the "is_algorithm_constraint" property
        let mainConstraint = AlgorithmConstraintFactory.createAlgorithmConfiguration(config.main);

        console.info("mainConstraint");
        console.info(mainConstraint);
        console.info(config);
        let generalizationConstraint = AlgorithmConstraintFactory.createAlgorithmConfiguration(config.general);
        console.info("generalizationConstraint");
        console.info(generalizationConstraint);


        const simpleConstraints = AlgorithmConstraintFactory.createSimpleConstraintsFromConfiguration(config.main);
        const constraintContainer = new ConstraintContainer([mainConstraint, generalizationConstraint], simpleConstraints, undefined, undefined);

        return constraintContainer
    }
}

