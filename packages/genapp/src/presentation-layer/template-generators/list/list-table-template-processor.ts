// TODO: merge / reduce imports
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateMetadata } from "../../../templates/template-consumer";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { ListItemCapabilityOptionsDependencyMap, ListItemCapabilityOptionsGenerator } from "./list-item-options-processor";
import { ListTableTemplate } from "./list-table-template";

export class ListTableTemplateProcessor extends PresentationLayerTemplateGenerator<ListTableTemplate> {

    strategyIdentifier: string = "list-table-react-generator";
    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    processTemplate(dependencies: PresentationLayerDependencyMap): LayerArtifact {

        const listItemOptionsArtifact = new ListItemCapabilityOptionsGenerator({
            filePath: `./${dependencies.aggregate.getAggregateNamePascalCase({ "suffix": "ListItemCapabilityOptions" })}.tsx`,
            templatePath: "./list/presentation-layer/item-capability-options"
        }).processTemplate({
            aggregate: dependencies.aggregate,
            transitions: dependencies.transitions
        } as ListItemCapabilityOptionsDependencyMap);

        const listTableComponentName: string = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "ListTable"
        });

        const tableTemplate: ListTableTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregate.getAggregateNamePascalCase(),
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
                supported_out_list_transitions: dependencies.transitions
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