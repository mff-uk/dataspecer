import { TemplateModel } from "../../engine/templates/template-interfaces";
import { GenerationContext } from "../../engine/generator-stage-interface";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver";
import { ApplicationLayerGenerator } from "../strategy-interface";

export interface ApplicationLayerTemplateDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator,
    dataLayerLinkArtifact: LayerArtifact
}

export abstract class ApplicationLayerTemplateGenerator<TemplateType extends TemplateModel>
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