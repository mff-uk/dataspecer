import { LayerArtifact } from "../engine/layer-artifact";
import { GeneratorStage, StageGenerationContext } from "../engine/generator-stage-interface";
import { ArtifactSaver } from "../utils/artifact-saver";
import { ApplicationLayerGenerator } from "./app-layer-strategy-interface";
import { ListAppLayerTemplateGenerator } from "./template-generators/list/app-layer-generator";

export class ListCapabilityApplicationLayerStage implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private readonly _applicationLayerStrategy: ApplicationLayerGenerator;

    private getAppLayerGenerator(): ApplicationLayerGenerator {

        // single generator strategy for app layer supported
        return new ListAppLayerTemplateGenerator({
            templatePath: "./list/application-layer/overview-app-logic",
            filePath: "./list-app-logic.ts"
        });
    }

    constructor() {
        this.artifactSaver = new ArtifactSaver("/application-layer");
        this._applicationLayerStrategy = this.getAppLayerGenerator();
    }

    generateStage(context: StageGenerationContext): Promise<LayerArtifact> {
        const appLayerArtifact = this._applicationLayerStrategy.generateApplicationLayer(context);

        return appLayerArtifact;
    }
}