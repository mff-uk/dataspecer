import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityGenerator } from "./capability-generator-interface";
import { CapabilityConfiguration } from "../application-config";

export class CustomCapabilityGenerator implements CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact> {
        throw new Error("Method not implemented.");
    }
}
