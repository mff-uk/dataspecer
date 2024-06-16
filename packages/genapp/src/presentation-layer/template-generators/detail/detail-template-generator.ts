import { StageGenerationContext } from "../../../engine/generator-stage-interface";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../../templates/template-consumer";
import { PresentationLayerGenerator } from "../../strategy-interface";
import { DetailReactComponentTemplate } from "./detail-template";

export class DetailComponentTemplateGenerator extends TemplateConsumer<DetailReactComponentTemplate> implements PresentationLayerGenerator {
    strategyIdentifier: string = "detail-react-component-generator";

    generatePresentationLayer(context: StageGenerationContext): Promise<LayerArtifact> {
        throw new Error("Method not implemented.");
    }
    
    processTemplate(dependencies: TemplateDependencyMap): LayerArtifact {
        throw new Error("Method not implemented.");
    }
}