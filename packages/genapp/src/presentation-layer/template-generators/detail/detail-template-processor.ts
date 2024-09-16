import { LayerArtifact } from "../../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";
import { JsonSchemaProvider } from "../../../data-layer/schema-providers/json-schema-provider";
import { AllowedTransition } from "../../../engine/transitions/transitions-generator";
import { ApplicationGraphEdgeType } from "../../../engine/graph";
import { UseNavigationHookGenerator } from "../../../capabilities/template-generators/capability-interface-generator";

interface DetailReactComponentTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string;
        export_name: string;
        detail_capability_app_layer: string;
        detail_app_layer_path: ImportRelativePath;
        json_schema: object;
        //json_schema_path: ImportRelativePath;
        capability_transitions: AllowedTransition[];
        capability_aggregations: AllowedTransition[];
        navigation_hook: string;
        navigation_hook_path: ImportRelativePath;
    };
}

export class DetailComponentTemplateProcessor extends PresentationLayerTemplateGenerator<DetailReactComponentTemplate> {
    strategyIdentifier: string = "detail-react-component-generator";

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const detailExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "InstanceDetail"
        });

        const jsonSchemaArtifact = (await new JsonSchemaProvider(dependencies.aggregate.specificationIri)
            .getSchemaArtifact(dependencies.aggregate));
        const useNavigationHook = await UseNavigationHookGenerator.processTemplate();

        const transitions = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Transition.toString()]!;
        const aggregations = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Aggregation.toString()]!;

        const instanceDetailTemplate: DetailReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregate.aggregateName,
                export_name: detailExportedName,
                detail_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                detail_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                json_schema: JSON.parse(jsonSchemaArtifact.sourceText),
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
            dependencies: [dependencies.appLogicArtifact, jsonSchemaArtifact]
        }

        return presentationLayerArtifact;
    }
}