import { CapabilityContext } from "../engine/generator-stage-interface";
import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityGenerator } from "./capability-generator-interface";

export class CustomCapabilityGenerator implements CapabilityGenerator {
    generateCapability(config: CapabilityContext): Promise<LayerArtifact> {
        throw new Error("Method not implemented.");
    }
}
