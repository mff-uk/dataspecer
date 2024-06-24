import { LayerArtifact } from "../../../engine/layer-artifact";
import { PresentationLayerDependencyMap } from "../presentation-layer-dependency-map";
import { PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { DetailReactComponentTemplate } from "./detail-template";

export class DetailComponentTemplateProcessor extends PresentationLayerTemplateGenerator<DetailReactComponentTemplate> {
    strategyIdentifier: string = "detail-react-component-generator";

    processTemplate(dependencies: PresentationLayerDependencyMap): LayerArtifact {
        
        const instanceDetailTemplate: DetailReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregateName,
                detail_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                detail_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName
            }
        }

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(instanceDetailTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: `${dependencies.aggregateName}InstanceDetail`,
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.appLogicArtifact]
        }

        return presentationLayerArtifact;
    }
}