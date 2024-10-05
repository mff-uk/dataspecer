import { LayoutMethod } from "../layout-iface";
import { ConstraintContainer } from "./constraint-container";
import { AlgorithmConfiguration, IAlgorithmOnlyConstraint, UserGivenAlgorithmConfiguration, UserGivenAlgorithmConfigurationslVersion2 } from "./constraints";
import { D3ForceConfiguration } from "./d3js/d3-constraints";
import { ElkForceConfiguration, ElkLayeredConfiguration, ElkStressConfiguration } from "./elk/elk-constraints";

class AlgorithmConstraintFactory {
    static getLayoutMethodForAlgorithmConstraint(algConstraint: AlgorithmConfiguration): LayoutMethod {
        if(algConstraint instanceof ElkStressConfiguration) {
            throw new Error("Unimplemented - Should return the layout method for Elk Stress algorithm");
        }
        else {
            throw new Error("Unimplemented - Define for the rest of the Algorithms");
        }
    }

    static createAlgorithmConfiguration(userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration): IAlgorithmOnlyConstraint | undefined {
        if(!userGivenAlgorithmConfiguration.should_be_considered) {
            return undefined;
        }
        switch(userGivenAlgorithmConfiguration.layout_alg) {
            case "elk_stress":
                return new ElkStressConfiguration(userGivenAlgorithmConfiguration);
            case "elk_layered":
                return new ElkLayeredConfiguration(userGivenAlgorithmConfiguration);
            case "elk_force":
                return new ElkForceConfiguration(userGivenAlgorithmConfiguration);
            case "random":
                return undefined;
            case "d3_force":
                return new D3ForceConfiguration(userGivenAlgorithmConfiguration);
            default:
                throw new Error("Implementation error You forgot to extend the TopLevelConstraint factory for new algorithm");
        }
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
        let mainConstraint: IAlgorithmOnlyConstraint = AlgorithmConstraintFactory.createAlgorithmConfiguration(config.main);
        let generalizationConstraint: IAlgorithmOnlyConstraint = AlgorithmConstraintFactory.createAlgorithmConfiguration(config.general);

        return new ConstraintContainer([mainConstraint, generalizationConstraint], undefined, undefined, undefined);
    }
}