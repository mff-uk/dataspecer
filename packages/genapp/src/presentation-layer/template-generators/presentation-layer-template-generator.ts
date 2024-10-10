import { TemplateDescription } from "../../engine/templates/template-interfaces";
import { GenerationContext } from "../../engine/generator-stage-interface";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap  } from "../../engine/templates/template-consumer";
import { PresentationLayerGenerator } from "../strategy-interface";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver";
import { NodeTransitionsView, TransitionsGenerator } from "../../engine/transitions/transitions-generator";
import { DetailNodeConfiguration } from "../../engine/graph";

export interface PresentationLayerDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator;
    appLogicArtifact: LayerArtifact;
    transitions: NodeTransitionsView;
    detailNodeConfig: DetailNodeConfiguration;
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

        const transitionsView = await (new TransitionsGenerator()
            .getNodeTransitions(context.currentNode, context.graph));

        const presentationLayerArtifact = await this.processTemplate({
            aggregate: context.aggregate,
            pathResolver: context._.pathResolver,
            appLogicArtifact: context.previousResult,
            transitions: transitionsView,
            detailNodeConfig: context.config
        } as PresentationLayerDependencyMap);

        return presentationLayerArtifact;
    }
}