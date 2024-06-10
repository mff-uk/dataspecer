import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityConfiguration } from "../application-config";

export interface CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}