// TODO: merge / reduce imports
import { ListItemCapabilityOptionsGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TransitionsGenerator } from "../../../engine/transitions/transitions-generator";
import { TemplateMetadata } from "../../../templates/template-consumer";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { ListTableTemplate } from "./list-table-template";

export class ListTableTemplateProcessor extends PresentationLayerTemplateGenerator<ListTableTemplate> {

    strategyIdentifier: string = "list-table-react-generator";
    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    processTemplate(dependencies: PresentationLayerDependencyMap): LayerArtifact {

        const listItemOptionsArtifact = ListItemCapabilityOptionsGenerator.processTemplate();
        const listTableComponentName: string = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "ListTable"
        });

        const tableTemplate: ListTableTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                presentation_layer_component_name: listTableComponentName,
                list_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                list_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                instance_capability_options: listItemOptionsArtifact.exportedObjectName,
                instance_capability_options_path: {
                    from: this._filePath,
                    to: listItemOptionsArtifact.filePath
                },
                supported_out_list_transitions: dependencies.transitionLabels
            }
        };

        const presentationLayerRender = this._templateRenderer.renderTemplate(tableTemplate);

        return {
            exportedObjectName: listTableComponentName,
            filePath: this._filePath,
            sourceText: presentationLayerRender,
            dependencies: [listItemOptionsArtifact, dependencies.appLogicArtifact]
        };
    }
}