// TODO: merge / reduce imports
import { LayerArtifact } from "../../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { ListItemCapabilityOptionsDependencyMap, ListItemCapabilityOptionsGenerator } from "./list-item-options-processor";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";
import { JsonSchemaProvider } from "../../../data-layer/schema-providers/json-schema-provider";

interface ListTableTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string;
        presentation_layer_component_name: string;
        list_capability_app_layer: string;
        list_app_layer_path: ImportRelativePath;
        instance_capability_options: string | null;
        instance_capability_options_path: ImportRelativePath | null;
        //supported_out_list_transitions: AllowedTransition[];
        table_schema: any;
    };
}

export class ListTableTemplateProcessor extends PresentationLayerTemplateGenerator<ListTableTemplate> {

    strategyIdentifier: string = "list-table-react-generator";

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const hasAnyTransitions = dependencies.transitions.length > 0;

        const listItemOptionsArtifact = await new ListItemCapabilityOptionsGenerator({
            filePath: `./${dependencies.aggregate.getAggregateNamePascalCase({ "suffix": "ListItemCapabilityOptions" })}.tsx`,
            templatePath: "./list/presentation-layer/item-capability-options"
        }).processTemplate({
            aggregate: dependencies.aggregate,
            transitions: dependencies.transitions
        } as ListItemCapabilityOptionsDependencyMap);

        const listTableComponentName: string = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "ListTable"
        });

        const jsonSchema = (await new JsonSchemaProvider(dependencies.aggregate.specificationIri)
            .getSchemaArtifact(dependencies.aggregate))
            .sourceText;

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
                table_schema: JSON.parse(jsonSchema),
                instance_capability_options: hasAnyTransitions
                    ? listItemOptionsArtifact.exportedObjectName
                    : null,
                instance_capability_options_path: hasAnyTransitions
                    ? {
                        from: this._filePath,
                        to: listItemOptionsArtifact.filePath
                    }
                    : null
            }
        };

        const presentationLayerRender = this._templateRenderer.renderTemplate(tableTemplate);
        const dependentArtifacts = [dependencies.appLogicArtifact];

        if (hasAnyTransitions) {
            dependentArtifacts.push(listItemOptionsArtifact);
        }

        return {
            exportedObjectName: listTableComponentName,
            filePath: this._filePath,
            sourceText: presentationLayerRender,
            dependencies: dependentArtifacts
        };
    }
}