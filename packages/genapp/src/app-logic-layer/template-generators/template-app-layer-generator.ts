import { TemplateDescription } from "../../engine/eta-template-renderer";
import { GenerationContext } from "../../engine/generator-stage-interface";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/template-consumer";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver";
import { ApplicationLayerGenerator } from "../strategy-interface";

export interface ApplicationLayerTemplateDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator,
    dataLayerLinkArtifact: LayerArtifact
}

export abstract class ApplicationLayerTemplateGenerator<TemplateType extends TemplateDescription>
    extends TemplateConsumer<TemplateType>
    implements ApplicationLayerGenerator {

    strategyIdentifier: string = "";

    async generateApplicationLayer(context: GenerationContext): Promise<LayerArtifact> {

        if (!context.previousResult) {
            throw new Error("Application layer depends on LayerArtifact generated within previous layer");
        }

        if (!context._.pathResolver) {
            throw new Error("path resolver not found");
        }

        const applicationLayer = await this.processTemplate({
            aggregate: context.aggregate,
            pathResolver: context._.pathResolver,
            dataLayerLinkArtifact: context.previousResult
        });

        return Promise.resolve(applicationLayer);
    }

}