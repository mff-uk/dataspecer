import { LayerArtifact } from "../../../engine/layer-artifact";
import { PresentationLayerDependencyMap } from "../presentation-layer-dependency-map";
import { PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { CreateInstanceReactComponentTemplate } from "./create-component-template";

export class CreateInstanceComponentTemplateProcessor extends PresentationLayerTemplateGenerator<CreateInstanceReactComponentTemplate> {
    strategyIdentifier: string = "create-react-component-generator";

    processTemplate(dependencies: PresentationLayerDependencyMap): LayerArtifact {

        const createInstanceComponentTemplate: CreateInstanceReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregateName,
                create_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                create_capability_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                }
            }
        }

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(createInstanceComponentTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: `Create${dependencies.aggregateName}Instance`,
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.appLogicArtifact]
        }

        return presentationLayerArtifact;
    }
}