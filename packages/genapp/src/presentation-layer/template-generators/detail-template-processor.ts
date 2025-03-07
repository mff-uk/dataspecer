import { LayerArtifact } from "../../engine/layer-artifact";
import { AllowedTransition } from "../../engine/transitions/transitions-generator";
import { ApplicationGraphEdgeType } from "../../engine/graph";
import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator";
import { AggregateMetadata } from "../../application-config";
import { DataJsonSchemaTemplateProcessor } from "./data-schema-processor";

/**
 * Interface representing the template model for rendering the React component for detail capability.
 *
 * @interface DetailReactComponentTemplate
 */
interface DetailReactComponentTemplate extends TemplateModel {
    /** @inheritdoc */
    placeholders: {
        page_title: string | null;
        aggregate: AggregateMetadata;
        export_name: string;
        detail_capability_app_layer: string;
        detail_app_layer_path: ImportRelativePath;
        json_schema_name: string,
        json_schema_path: ImportRelativePath,
        ui_schema: string,
        capability_transitions: AllowedTransition[];
        capability_aggregations: AllowedTransition[];
        navigation_hook: string;
        navigation_hook_path: ImportRelativePath;
    };
}

/**
 * The `DetailComponentTemplateProcessor` class is responsible for rendering the React component from a template
 * and thus generating the presentation layer code for detail capability.
 * It extends the `PresentationLayerTemplateGenerator` class and makes use of `DetailReactComponentTemplate`
 * for template population and rendering.
 *
 * @extends PresentationLayerTemplateGenerator<DetailReactComponentTemplate>
 */
export class DetailComponentTemplateProcessor extends PresentationLayerTemplateGenerator<DetailReactComponentTemplate> {
    strategyIdentifier: string = "detail-react-component-generator";

    private static readonly _detailComponentTemplatePath: string = "./detail/presentation-layer/instance-detail-component";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: DetailComponentTemplateProcessor._detailComponentTemplatePath
        })
    }

    /**
     * This method is responsible for the population and rendering of the React component template for the detail capability.
     * After all dependencies needed by template (@see {DetailReactComponentTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting React component.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A promise that resolves to the artifact which contains generated React component for detail capability.
     */
    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const detailExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "InstanceDetail"
        });

        const useNavigationHook = await UseNavigationHookGenerator.processTemplate();

        const dataSchemaProcessor = new DataJsonSchemaTemplateProcessor(`../schemas/${dependencies.aggregate.getAggregateNamePascalCase()}DataSchema.ts`)
        const dataSchema = await dataSchemaProcessor.processTemplate(dependencies);
        const uiSchema = dataSchemaProcessor.generateUISchema(dependencies.aggregate);

        const transitions = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Transition.toString()]!;
        const aggregations = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Aggregation.toString()]!;

        const instanceDetailTemplate: DetailReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                page_title: this.getTemplatePageTitle(dependencies.detailNodeConfig.pageTitle),
                aggregate: dependencies.aggregate,
                export_name: detailExportedName,
                detail_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                detail_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                json_schema_name: dataSchema.exportedObjectName,
                json_schema_path: {
                    from: this._filePath,
                    to: dataSchema.filePath
                },
                ui_schema: JSON.stringify({
                    "ui:submitButtonOptions": {
                        "norender": true,
                    },
                    ...uiSchema
                }, null, 2),
                capability_transitions: transitions,
                capability_aggregations: aggregations,
                navigation_hook: useNavigationHook.exportedObjectName,
                navigation_hook_path: {
                    from: this._filePath,
                    to: useNavigationHook.filePath
                }
            }
        }

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(instanceDetailTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: detailExportedName,
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.appLogicArtifact]
        }

        return presentationLayerArtifact;
    }
}