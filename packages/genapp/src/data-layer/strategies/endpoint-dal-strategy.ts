import { LayerArtifact } from "../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../dal-generator-strategy-interface";

class EndpointDalGeneratorStrategy<EndpointType> implements DalGeneratorStrategy {
    
    strategyIdentifier: string = "endpoint<type>";

    generateDataLayer(): Promise<LayerArtifact> {
        throw new Error("Method not implemented.");
    }
}