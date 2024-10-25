import _ from "lodash";
import { StressConfiguration, UserGivenAlgorithmConfiguration, UserGivenAlgorithmConfigurationStress } from "../constraints";


/**
 * Stores configuration for d3 force model
 */
export class D3ForceConfiguration extends StressConfiguration {
    // TODO: I noticed that d3 is actually much stronger than the stress in Elk, it is basically combination of Stress and Force from Elk + more
    getAllRelevantConstraintKeys(): string[] {
        return super.getAllRelevantConstraintKeys().concat([
            "min_distance_between_nodes",
        ]);
    }

    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration) {
        super(givenAlgorithmConstraints);
        this.data = _.pick(givenAlgorithmConstraints, this.getAllRelevantConstraintKeys()) as UserGivenAlgorithmConfigurationStress;
        throw new Error("Initialize (or don't use at all) the d3Data object");
    }


    addAdvancedSettingsForUnderlying(advancedSettings: object): void {
        throw new Error("TODO: Method not implemented.");
    }


    d3Data: object = undefined;
}
