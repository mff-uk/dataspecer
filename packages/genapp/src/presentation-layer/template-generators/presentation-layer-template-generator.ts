import { TemplateDescription } from "../../engine/eta-template-renderer";
import { GenerationContext } from "../../engine/generator-stage-interface";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap  } from "../../templates/template-consumer";
import { PresentationLayerGenerator } from "../strategy-interface";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver";
import { AllowedTransition, TransitionsGenerator } from "../../engine/transitions/transitions-generator";

export interface PresentationLayerDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator;
    appLogicArtifact: LayerArtifact;
    transitions: AllowedTransition[];
}

export abstract class PresentationLayerTemplateGenerator<TemplateType extends TemplateDescription>
    extends TemplateConsumer<TemplateType>
    implements PresentationLayerGenerator {

    strategyIdentifier: string = "";

    async generatePresentationLayer(context: GenerationContext): Promise<LayerArtifact> {
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

        const transitions = await (new TransitionsGenerator()
            .getNodeTransitions(context.currentNode, context.graph));

        const presentationLayerArtifact = this.processTemplate({
            aggregate: context.aggregate,
            pathResolver: context._.pathResolver,
            appLogicArtifact: context.previousResult,
            transitions: transitions
        } as PresentationLayerDependencyMap);

        return presentationLayerArtifact;
    }
}