import { CapabilityConfiguration } from "../application-config";
import { StageGenerationContext } from "../engine/generator-stage-interface";
import { LayerArtifact } from "../engine/layer-artifact";

export interface Capability {
    identifier: string;
    entryPoint?: LayerArtifact;
    generateCapabilityOld(context: StageGenerationContext): Promise<LayerArtifact>;
};

export interface CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}

export class CustomCapabilityGenerator implements CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact> {
        throw new Error("Method not implemented.");
    }
}
