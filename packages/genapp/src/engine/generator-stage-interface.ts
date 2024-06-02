import { LayerArtifact } from "./layer-artifact";
import { CapabilityConfiguration } from "../application-config";
import { ArtifactSaver } from "../utils/artifact-saver";

export type StageGenerationContext = { 
    aggregateName: string;
    config: CapabilityConfiguration;
    previousResult?: LayerArtifact;
};

export interface GeneratorStage {
    artifactSaver?: ArtifactSaver;
    generateStage(context: StageGenerationContext): Promise<LayerArtifact>;
}