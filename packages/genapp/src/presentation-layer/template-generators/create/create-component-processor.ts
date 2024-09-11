import { JsonSchemaProvider } from "../../../data-layer/strategies/ldkit/ldkit-schema-provider";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";
import { AllowedTransition } from "../../../engine/transitions/transitions-generator";

interface CreateInstanceReactComponentTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string,
        exported_object_name: string;
        create_capability_app_layer: string,
        create_capability_app_layer_path: ImportRelativePath,
        json_schema: string,
        //json_schema_path: ImportRelativePath,
        supported_out_create_edges: AllowedTransition[]
    };
}

export class CreateInstanceComponentTemplateProcessor extends PresentationLayerTemplateGenerator<CreateInstanceReactComponentTemplate> {
    strategyIdentifier: string = "create-react-component-generator";

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const createExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            prefix: "Create",
            suffix: "Instance"
        });

        const schemaProvider = new JsonSchemaProvider(dependencies.aggregate.specificationIri);
        const jsonSchemaArtifact = await schemaProvider.getSchemaArtifact(dependencies.aggregate);

        const createInstanceComponentTemplate: CreateInstanceReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregate.getAggregateNamePascalCase(),
                exported_object_name: createExportedName,
                create_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                create_capability_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                json_schema: jsonSchemaArtifact.sourceText,
                // json_schema_path: {
                //     from: this._filePath,
                //     to: jsonSchemaArtifact.filePath
                // },
                supported_out_create_edges: dependencies.transitions
            }
        }

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(createInstanceComponentTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: createExportedName,
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.appLogicArtifact, jsonSchemaArtifact]
        }

        return presentationLayerArtifact;
    }
}