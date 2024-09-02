import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityGenerator } from "./capability-generator-interface";
import { CapabilityConfiguration } from "../engine/generator-stage-interface";

export class CustomCapabilityGenerator implements CapabilityGenerator {
    getType(): string {
        throw new Error("Method not implemented.");
    }

    getCapabilityLabel = (): string => "custom";

    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact> {
        throw new Error("Method not implemented.");
    }
}
