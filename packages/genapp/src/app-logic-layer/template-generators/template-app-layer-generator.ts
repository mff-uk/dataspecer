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

/**
 * Abstract class which acts as a base for application layer generators.
 * This class provides a method to generate an application layer using template approach. It ensures that the required
 * dependencies are provided in the context before invoking the specific template generator for the given capability.
 *
 * @extends TemplateConsumer<TemplateType>
 * @implements ApplicationLayerGenerator
 */
export abstract class ApplicationLayerTemplateGenerator<TemplateType extends TemplateModel>
    extends TemplateConsumer<TemplateType>
    implements ApplicationLayerGenerator {

    strategyIdentifier: string = "";

    /**
     * @inheritdoc
     *
     * Within this class, this method uses specific layer generation approach - generating using templates.
     * Besides invoking the specific template generator for specific apability, this method performs a check, whether
     * required dependencies needed for generation are provided.
     */
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

        return applicationLayer;
    }

}