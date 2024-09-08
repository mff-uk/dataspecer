import { JsonSchemaProvider } from "../../data-layer/strategies/ldkit/ldkit-schema-provider";
import { ImportRelativePath, TemplateDescription } from "../../engine/eta-template-renderer";
import { LayerArtifact } from "../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator";

interface JsonSchemaHookTemplate extends TemplateDescription {
    placeholders: {
        json_schema: string;
        json_schema_object_name: string;
        json_schema_path: ImportRelativePath;
    }
}

class JsonSchemaHookGenerator extends PresentationLayerTemplateGenerator<JsonSchemaHookTemplate> {

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const schemaProvider = new JsonSchemaProvider(dependencies.aggregate.specificationIri);
        const jsonSchemaArtifact = await schemaProvider.getSchemaArtifact(dependencies.aggregate);

        const jsonSchemaHookTemplate: JsonSchemaHookTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                json_schema: jsonSchemaArtifact.sourceText,
                json_schema_object_name: jsonSchemaArtifact.exportedObjectName,
                json_schema_path: {
                    from: this._filePath,
                    to: jsonSchemaArtifact.filePath
                }
            }
        };

        const useJsonSchemaHookRender: string = this._templateRenderer.renderTemplate(jsonSchemaHookTemplate);

        const useJsonSchemaHookArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: "useJsonSchema",
            sourceText: useJsonSchemaHookRender,
            dependencies: [jsonSchemaArtifact]
        };

        return useJsonSchemaHookArtifact;
    }
}