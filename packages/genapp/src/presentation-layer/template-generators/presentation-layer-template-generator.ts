import { TemplateDescription } from "../../engine/eta-template-renderer";
import { GenerationContext } from "../../engine/generator-stage-interface";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer } from "../../templates/template-consumer";
import { PresentationLayerGenerator } from "../strategy-interface";

export abstract class PresentationLayerTemplateGenerator<TemplateType extends TemplateDescription>
    extends TemplateConsumer<TemplateType> implements PresentationLayerGenerator {
    
    strategyIdentifier: string = "";

    generatePresentationLayer(context: GenerationContext): Promise<LayerArtifact> {
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
            // TODO: Change to human label aggregate name identifier (without spaces pascal camel case)
            aggregateHumanLabel: context.technicalAggregateName,
            pathResolver: context._.pathResolver,   
            appLogicArtifact: context.previousResult,
            graph: context.graph,
            currentNode: context.currentNode
        });

        return Promise.resolve(presentationLayerArtifact);
    }
}