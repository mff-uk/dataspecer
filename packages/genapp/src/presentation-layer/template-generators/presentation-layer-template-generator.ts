import { TemplateDescription } from "../../engine/eta-template-renderer";
import { StageGenerationContext } from "../../engine/generator-stage-interface";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer } from "../../templates/template-consumer";
import { PresentationLayerGenerator } from "../strategy-interface";

export abstract class PresentationLayerTemplateGenerator<TemplateType extends TemplateDescription>
    extends TemplateConsumer<TemplateType> implements PresentationLayerGenerator {
    
    strategyIdentifier: string = "";

    generatePresentationLayer(context: StageGenerationContext): Promise<LayerArtifact> {
        if (!context.previousResult) {
            const errorArtifact: LayerArtifact = {
                filePath: "",
                exportedObjectName: "ErrorPage",
                sourceText: ""
            }

            return Promise.resolve(errorArtifact);
        }

        if (!context._.pathResolver) {
            throw new Error("Missing path resolver");
        }

        const presentationLayerArtifact = this.processTemplate({
            pathResolver: context._.pathResolver,   
            listAppLogicArtifact: context.previousResult
        });

        return Promise.resolve(presentationLayerArtifact);
    }
}