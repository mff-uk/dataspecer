import { LayerArtifact } from "../../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";
import { JsonSchemaProvider } from "../../../data-layer/schema-providers/json-schema-provider";
import { NodeTransitionsView } from "../../../engine/transitions/transitions-generator";

interface DetailReactComponentTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string;
        export_name: string;
        detail_capability_app_layer: string;
        detail_app_layer_path: ImportRelativePath;
        json_schema: string;
        json_schema_path: ImportRelativePath;
        capability_transitions: NodeTransitionsView;
    };
}

export class DetailComponentTemplateProcessor extends PresentationLayerTemplateGenerator<DetailReactComponentTemplate> {
    strategyIdentifier: string = "detail-react-component-generator";

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const detailExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "InstanceDetail"
        });

        const schemaProvider = new JsonSchemaProvider(dependencies.aggregate.specificationIri);
        const jsonSchemaArtifact = await schemaProvider.getSchemaArtifact(dependencies.aggregate);

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
                json_schema: jsonSchemaArtifact.exportedObjectName,
                json_schema_path: {
                    from: this._filePath,
                    to: jsonSchemaArtifact.filePath
                },
                capability_transitions: dependencies.transitions
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