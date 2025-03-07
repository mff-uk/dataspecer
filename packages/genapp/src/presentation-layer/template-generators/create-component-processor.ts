import { LayerArtifact } from "../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";
import { ApplicationGraphEdgeType } from "../../engine/graph";
import { AllowedTransition } from "../../engine/transitions/transitions-generator";
import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { AggregateMetadata } from "../../application-config";
import { DataJsonSchemaTemplateProcessor } from "./data-schema-processor";

/**
 * Interface representing the template model for rendering a React component used for create capability.
 *
 * @extends TemplateModel
 */
interface CreateInstanceReactComponentTemplate extends TemplateModel {
    /** @inheritdoc */
    placeholders: {
        aggregate: AggregateMetadata,
        page_title: string | null,
        exported_object_name: string;
        create_capability_app_layer: string,
        create_capability_app_layer_path: ImportRelativePath,
        json_schema_name: string,
        json_schema_path: ImportRelativePath,
        navigation_hook: string,
        navigation_hook_path: ImportRelativePath,
        redirects: AllowedTransition[];
        ui_schema: string
    };
}

/**
 * The `CreateInstanceComponentTemplateProcessor` class is responsible for rendering the React component from a template
 * and thus generating the presentation layer code for instance creation capability.
 * It extends the `PresentationLayerTemplateGenerator` class and makes use of `CreateInstanceReactComponentTemplate`
 * for template population and rendering.
 *
 * @extends PresentationLayerTemplateGenerator<CreateInstanceReactComponentTemplate>
 */
export class CreateInstanceComponentTemplateProcessor extends PresentationLayerTemplateGenerator<CreateInstanceReactComponentTemplate> {
    strategyIdentifier: string = "create-react-component-generator";

    private static readonly _createComponentTemplatePath: string = "./create/presentation-layer/create-instance-component";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: CreateInstanceComponentTemplateProcessor._createComponentTemplatePath
        })
    }

    /**
     * This method is responsible for the population and rendering of the React component template for the create capability implementation.
     * After all dependencies needed by template (@see {CreateInstanceReactComponentTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting React component.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A promise that resolves to the artifact which contains generated React component for instance creation capability.
     */
    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const createExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            prefix: "Create",
            suffix: "Instance"
        });

        const dataSchemaProcessor = new DataJsonSchemaTemplateProcessor(`../schemas/${dependencies.aggregate.getAggregateNamePascalCase()}DataSchema.ts`)
        const dataSchema = await dataSchemaProcessor.processTemplate(dependencies);
        const uiSchema = dataSchemaProcessor.generateUISchema(dependencies.aggregate);

        const redirectTransitions = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Redirection.toString()]!;

        const useNavigationHook = await UseNavigationHookGenerator.processTemplate();

        const createInstanceComponentTemplate: CreateInstanceReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate: dependencies.aggregate,
                page_title: this.getTemplatePageTitle(dependencies.detailNodeConfig.pageTitle),
                exported_object_name: createExportedName,
                create_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                create_capability_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                navigation_hook: useNavigationHook.exportedObjectName,
                navigation_hook_path: {
                    from: this._filePath,
                    to: useNavigationHook.filePath
                },
                redirects: redirectTransitions,
                json_schema_name: dataSchema.exportedObjectName,
                json_schema_path: {
                    from: this._filePath,
                    to: dataSchema.filePath
                },
                ui_schema: JSON.stringify(uiSchema, null, 2)
            }
        }

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(createInstanceComponentTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: createExportedName,
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.appLogicArtifact, dataSchema]
        }

        return presentationLayerArtifact;
    }
}