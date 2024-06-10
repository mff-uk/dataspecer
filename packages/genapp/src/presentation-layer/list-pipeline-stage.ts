import { GeneratorStage, StageGenerationContext } from "../engine/generator-stage-interface";
import { ArtifactSaver } from "../utils/artifact-saver";
import { LayerArtifact } from "../engine/layer-artifact";
import { PresentationLayerGeneratorStrategy } from "./presentation-layer-strategy-interface";
import { ListTableTemplateGenerator } from "./template-generators/list/list-table-template-generator";

export class PresentationLayerStage implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private readonly _presentationLayerStrategy: PresentationLayerGeneratorStrategy;

    private getPresentationLayerStrategy(): PresentationLayerGeneratorStrategy {
        // single generator strategy for presentation layer supported
        return new ListTableTemplateGenerator({
            filePath: "ListTable.tsx",
            templatePath: "./list/presentation-layer/table-component"
        });
    }

    constructor() {
        this.artifactSaver = new ArtifactSaver("/presentation-layer/list");
        this._presentationLayerStrategy = this.getPresentationLayerStrategy();
    }

    generateStage(context: StageGenerationContext): Promise<LayerArtifact> {
        
        const presentationLayerArtifact = this._presentationLayerStrategy.generatePresentationLayer(context);
        return presentationLayerArtifact;
    }
}