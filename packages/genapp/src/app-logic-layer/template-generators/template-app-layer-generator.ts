import { TemplateDescription } from "../../engine/eta-template-renderer";
import { StageGenerationContext } from "../../engine/generator-stage-interface";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer } from "../../templates/template-consumer";
import { ApplicationLayerGenerator } from "../strategy-interface";

export abstract class ApplicationLayerTemplateGenerator<TemplateType extends TemplateDescription>
    extends TemplateConsumer<TemplateType> implements ApplicationLayerGenerator {
    
    strategyIdentifier: string = "";

    generateApplicationLayer(context: StageGenerationContext): Promise<LayerArtifact> {
        
        if (!context.previousResult) {
            throw new Error("Application layer depends on LayerArtifact generated within previous layer");
        }

        const applicationLayer = this.processTemplate({
            dataLayerLinkArtifact: context.previousResult
        });

        return Promise.resolve(applicationLayer);
    }

}