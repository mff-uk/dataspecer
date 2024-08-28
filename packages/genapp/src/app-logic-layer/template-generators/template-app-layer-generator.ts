import { TemplateDescription } from "../../engine/eta-template-renderer";
import { GenerationContext } from "../../engine/generator-stage-interface";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer } from "../../templates/template-consumer";
import { ApplicationLayerGenerator } from "../strategy-interface";

export abstract class ApplicationLayerTemplateGenerator<TemplateType extends TemplateDescription>
    extends TemplateConsumer<TemplateType> implements ApplicationLayerGenerator {
    
    strategyIdentifier: string = "";

    generateApplicationLayer(context: GenerationContext): Promise<LayerArtifact> {
        
        if (!context.previousResult) {
            throw new Error("Application layer depends on LayerArtifact generated within previous layer");
        }

        if (!context._.pathResolver) {
            throw new Error("path resolver not found");
        }

        const applicationLayer = this.processTemplate({
            // TODO: Change to human label aggregate name identifier (without spaces pascal camel case)
            aggregateHumanLabel: context.technicalAggregateName,
            pathResolver: context._.pathResolver,
            dataLayerLinkArtifact: context.previousResult
        });

        return Promise.resolve(applicationLayer);
    }

}