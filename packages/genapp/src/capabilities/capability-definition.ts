import { CapabilityConfiguration } from "../application-config";
import { LayerArtifact } from "../engine/layer-artifact";

export interface CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}

export class CustomCapabilityGenerator implements CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact> {
        throw new Error("Method not implemented.");
    }
}
