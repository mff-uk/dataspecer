import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateMetadata } from "../../../templates/template-consumer";
import { BaseArtifactSaver } from "../../../utils/artifact-saver";
import { PresentationLayerDependencyMap } from "../presentation-layer-dependency-map";
import { PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { ListTableTemplate } from "./list-table-template";

export class ListTableTemplateProcessor extends PresentationLayerTemplateGenerator<ListTableTemplate> {

    strategyIdentifier: string = "list-table-react-generator";
    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }
    
    processTemplate(dependencies: PresentationLayerDependencyMap): LayerArtifact {

        const tableTemplate: ListTableTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                list_capability_app_layer: dependencies.listAppLogicArtifact.exportedObjectName,
                list_app_layer_path: {
                    from: "ListTable" in BaseArtifactSaver.savedArtifactsMap ? BaseArtifactSaver.savedArtifactsMap["ListTable"] : this._filePath,
                    to: dependencies.listAppLogicArtifact.filePath
                }
            }
        };

        const presentationLayerRender = this._templateRenderer.renderTemplate(tableTemplate);

        return {
            exportedObjectName: "ListTable",
            filePath: this._filePath,
            sourceText: presentationLayerRender,
            dependencies: [dependencies.listAppLogicArtifact]
        };
    }
}