import { LayerArtifact } from "../../../engine/layer-artifact";
import { TransitionsGenerator } from "../../../engine/transitions/transitions-generator";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { CreateInstanceReactComponentTemplate } from "./create-component-template";

export class CreateInstanceComponentTemplateProcessor extends PresentationLayerTemplateGenerator<CreateInstanceReactComponentTemplate> {
    strategyIdentifier: string = "create-react-component-generator";

    processTemplate(dependencies: PresentationLayerDependencyMap): LayerArtifact {

        const createExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            prefix: "Create",
            suffix: "Instance"
        });

        const createInstanceComponentTemplate: CreateInstanceReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: createExportedName,
                create_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                create_capability_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                useJsonSchema_hook: "",
                useJsonSchema_hook_path: {
                    from: "",
                    to: ""
                },
                supported_out_create_edges: dependencies.transitionLabels
            }
        }

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(createInstanceComponentTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: createExportedName,
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.appLogicArtifact]
        }

        return presentationLayerArtifact;
    }
}