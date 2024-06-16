import { LayerArtifact } from "../../../engine/layer-artifact";
import { PresentationLayerDependencyMap } from "../presentation-layer-dependency-map";
import { PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { DetailReactComponentTemplate } from "./detail-template";

export class DetailComponentTemplateProcessor extends PresentationLayerTemplateGenerator<DetailReactComponentTemplate> {
    strategyIdentifier: string = "detail-react-component-generator";

    processTemplate(dependencies: PresentationLayerDependencyMap): LayerArtifact {
        
        const instanceDetailTemplate: DetailReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {}
        }

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(instanceDetailTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: "InstanceDetail",
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.listAppLogicArtifact]
        }

        return presentationLayerArtifact;
    }
}