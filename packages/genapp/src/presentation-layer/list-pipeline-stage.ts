import { ArtifactSaver } from "../utils/artifact-saver";
import { LayerArtifact } from "../engine/layer-artifact";
import { GeneratorStage, StageGenerationContext } from "../engine/generator-stage-interface";
import { PresentationLayerGenerator } from "./presentation-layer-strategy-interface";
import { PresentationLayerGeneratorFactory, PresentationLayerTemplateGeneratorFactory } from "./presentation-layer-generator-factory";

export class PresentationLayerStage implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private readonly _presentationLayerStrategy: PresentationLayerGenerator; 

    constructor(targetCapabilityName: string, generatorFactory?: PresentationLayerGeneratorFactory) {
        if (!targetCapabilityName || targetCapabilityName === "") {
            throw new Error("Unable to generate presentation layer for capability with empty / invalid name.");
        }

        this.artifactSaver = new ArtifactSaver(`/presentation-layer/${targetCapabilityName}`);
        this._presentationLayerStrategy = (generatorFactory ?? PresentationLayerTemplateGeneratorFactory)
            .getPresentationLayerGenerator(targetCapabilityName);
    }

    generateStage(context: StageGenerationContext): Promise<LayerArtifact> {
        const presentationLayerArtifact = this._presentationLayerStrategy.generatePresentationLayer(context);
        return presentationLayerArtifact;
    }
}