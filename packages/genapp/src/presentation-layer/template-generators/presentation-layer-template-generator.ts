import { TemplateDescription } from "../../engine/eta-template-renderer";
import { GenerationContext } from "../../engine/generator-stage-interface";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer } from "../../templates/template-consumer";
import { PresentationLayerGenerator } from "../strategy-interface";
import { ApplicationGraph, ApplicationGraphNode } from "../../application-config";
import { TemplateDependencyMap } from "../../templates/template-consumer";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver";

export interface PresentationLayerDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator,
    appLogicArtifact: LayerArtifact;
    graph: ApplicationGraph;
    currentNode: ApplicationGraphNode;
}

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
            aggregate: context.aggregate,
            pathResolver: context._.pathResolver,   
            appLogicArtifact: context.previousResult,
            graph: context.graph,
            currentNode: context.currentNode
        });

        return Promise.resolve(presentationLayerArtifact);
    }
}