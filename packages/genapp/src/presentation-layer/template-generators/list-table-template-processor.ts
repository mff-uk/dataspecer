// TODO: merge / reduce imports
import { LayerArtifact } from "../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator";
import { ListItemCapabilityOptionsDependencyMap, ListItemCapabilityOptionsGenerator as ListItemOptionsGenerator } from "./list-item-options-processor";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";
import { JsonSchemaProvider } from "../../data-layer/schema-providers/json-schema-provider";
import { CapabilityType } from "../../capabilities";
import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { PaginationComponentGenerator } from "./pagination-processor";

interface ListTableTemplate extends TemplateModel {
    placeholders: {
        aggregate_name: string;
        page_title: string | null;
        presentation_layer_component_name: string;
        list_capability_app_layer: string;
        list_app_layer_path: ImportRelativePath;
        instance_capability_options: string | null;
        instance_capability_options_path: ImportRelativePath | null;
        table_schema: object;
        list_collection_transitions: any[];
        navigation_hook: string;
        navigation_hook_path: ImportRelativePath;
        aggregate_pagination: string;
        aggregate_pagination_path: ImportRelativePath;
    };
}

export class ListTableTemplateProcessor extends PresentationLayerTemplateGenerator<ListTableTemplate> {

    strategyIdentifier: string = "list-table-react-generator";

    private static readonly _listComponentTemplatePath: string = "./list/presentation-layer/table-component";

    /**
     * Creates an instance of `ListTableTemplateProcessor`.
     *
     * @param {string} outputFilePath - The output file path where the generated template will be saved.
     */
    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: ListTableTemplateProcessor._listComponentTemplatePath
        });
    }

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const groupedTransitions = dependencies.transitions.groupByCapabilityType();
        const collectionTransitions = groupedTransitions[CapabilityType.Collection.toString()]!;
        const instanceTransitions = groupedTransitions[CapabilityType.Instance.toString()]!;
        const hasAnyInstanceTransitions = instanceTransitions.length > 0;

        const listItemOptionsArtifact = await (new ListItemOptionsGenerator(
            `./${dependencies.aggregate.getAggregateNamePascalCase({ suffix: "ListItemOptions" })}.tsx`
        ).processTemplate({
            aggregate: dependencies.aggregate,
            transitions: instanceTransitions
        } as ListItemCapabilityOptionsDependencyMap));

        const useNavigationHook = await UseNavigationHookGenerator.processTemplate();

        let pagination = await new PaginationComponentGenerator(
            `./${dependencies.aggregate.getAggregateNamePascalCase({ suffix: "Pagination" })}.tsx`
        )
        .processTemplate({
            aggregate: dependencies.aggregate
        });

        const listTableComponentName: string = dependencies.aggregate.getAggregateNamePascalCase({ suffix: "ListTable" });

        const jsonSchema = (await new JsonSchemaProvider(dependencies.aggregate.specificationIri)
            .getSchemaArtifact(dependencies.aggregate))
            .sourceText;

        const tableTemplate: ListTableTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregate.getAggregateNamePascalCase(),
                page_title: this.getTemplatePageTitle(dependencies.detailNodeConfig.pageTitle),
                presentation_layer_component_name: listTableComponentName,
                list_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                list_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                table_schema: JSON.parse(jsonSchema),
                list_collection_transitions: collectionTransitions,
                instance_capability_options: hasAnyInstanceTransitions
                    ? listItemOptionsArtifact.exportedObjectName
                    : null,
                instance_capability_options_path: hasAnyInstanceTransitions
                    ? {
                        from: this._filePath,
                        to: listItemOptionsArtifact.filePath
                    }
                    : null,
                navigation_hook: useNavigationHook.exportedObjectName,
                navigation_hook_path: {
                    from: this._filePath,
                    to: useNavigationHook.filePath
                },
                aggregate_pagination: pagination.exportedObjectName,
                aggregate_pagination_path: {
                    from: this._filePath,
                    to: pagination.filePath
                }
            }
        };

        const presentationLayerRender = this._templateRenderer.renderTemplate(tableTemplate);
        const dependentArtifacts = [dependencies.appLogicArtifact, useNavigationHook, pagination];

        if (hasAnyInstanceTransitions) {
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