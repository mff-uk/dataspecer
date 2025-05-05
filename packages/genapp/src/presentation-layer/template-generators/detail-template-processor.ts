import { ArtifactCache } from "../../utils/artifact-saver.ts";
import { LayerArtifact } from "../../engine/layer-artifact.ts";
import { AllowedTransition } from "../../engine/transitions/transitions-generator.ts";
import { ApplicationGraphEdgeType } from "../../engine/graph/index.ts";
import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator.ts";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces.ts";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator.ts";

interface DetailReactComponentTemplate extends TemplateModel {
    placeholders: {
        page_title: string | null;
        aggregate_name: string;
        export_name: string;
        detail_capability_app_layer: string;
        detail_app_layer_path: ImportRelativePath;
        schema: object,
        capability_transitions: AllowedTransition[];
        capability_aggregations: AllowedTransition[];
        navigation_hook: string;
        navigation_hook_path: ImportRelativePath;
    };
}

export class DetailComponentTemplateProcessor extends PresentationLayerTemplateGenerator<DetailReactComponentTemplate> {
    strategyIdentifier: string = "detail-react-component-generator";

    private static readonly _detailComponentTemplatePath: string = "./detail/presentation-layer/instance-detail-component";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: DetailComponentTemplateProcessor._detailComponentTemplatePath
        })
    }

    private tryRestoreAggregateDataModelInterface(aggregateTechnicalLabel: string): object {
        const aggregateSchemaInterface = ArtifactCache.content[`__${aggregateTechnicalLabel}DataModelInterface`];

        if (!aggregateSchemaInterface) {
            return { id: "string" };
        }

        const schemaInterface = JSON.parse(aggregateSchemaInterface);
        console.log(schemaInterface);

        return schemaInterface;
    }

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const detailExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "InstanceDetail"
        });

        const useNavigationHook = await UseNavigationHookGenerator.processTemplate();
        const dataSchemaInterface = this.tryRestoreAggregateDataModelInterface(dependencies.aggregate.technicalLabel);

        const transitions = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Transition.toString()]!;
        const aggregations = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Aggregation.toString()]!;

        const instanceDetailTemplate: DetailReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                page_title: this.getTemplatePageTitle(dependencies.detailNodeConfig.pageTitle),
                aggregate_name: dependencies.aggregate.aggregateName,
                export_name: detailExportedName,
                detail_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                detail_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                schema: dataSchemaInterface,
                capability_transitions: transitions,
                capability_aggregations: aggregations,
                navigation_hook: useNavigationHook.exportedObjectName,
                navigation_hook_path: {
                    from: this._filePath,
                    to: useNavigationHook.filePath
                },
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