import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../../engine/template-consumer";

interface LdkitObjectModelTypeTemplate extends TemplateDescription {
    placeholders: {
        object_model_type_name: string,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath
    }
}

export class LdkitObjectModelTypeGenerator extends TemplateConsumer<LdkitObjectModelTypeTemplate> {

    processTemplate(dependencies: TemplateDependencyMap): Promise<LayerArtifact> {

        const objectModelTypeName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "ModelType"
        });

        const modelTypeTemplate: LdkitObjectModelTypeTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                object_model_type_name: objectModelTypeName,
                ldkit_schema: "",
                ldkit_schema_path: {
                    from: this._filePath,
                    to: ""
                }

            }
        }

        const render = this._templateRenderer.renderTemplate(modelTypeTemplate);

        const objectModelTypeArtifact: LayerArtifact = {
            exportedObjectName: objectModelTypeName,
            filePath: this._filePath,
            sourceText: render
        };

        return Promise.resolve(objectModelTypeArtifact);
    }
}