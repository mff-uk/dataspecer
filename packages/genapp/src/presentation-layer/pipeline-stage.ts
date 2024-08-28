import { ArtifactSaver, GeneratedFilePathCalculator } from "../utils/artifact-saver";
import { LayerArtifact } from "../engine/layer-artifact";
import { GeneratorStage, StageGenerationContext } from "../engine/generator-stage-interface";
import { PresentationLayerGenerator } from "./strategy-interface";

export class PresentationLayerStage implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private readonly _presentationLayerStrategy: PresentationLayerGenerator; 

    constructor(capabilityLabel: string, presentationLayerGenerator: PresentationLayerGenerator) {
        if (!capabilityLabel || capabilityLabel === "") {
            throw new Error("Unable to generate presentation layer for capability with empty / invalid name.");
        }

        this.artifactSaver = new ArtifactSaver(`/presentation-layer/${capabilityLabel}`);
        this._presentationLayerStrategy = presentationLayerGenerator;
    }

    generateStage(context: StageGenerationContext): Promise<LayerArtifact> {
        context._.pathResolver = this.artifactSaver as GeneratedFilePathCalculator;
        const presentationLayerArtifact = this._presentationLayerStrategy.generatePresentationLayer(context);
        return presentationLayerArtifact;
    }
}