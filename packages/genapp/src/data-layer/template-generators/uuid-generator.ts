import { IdGeneratorInterfaceGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";

interface UuidGeneratorTemplate extends TemplateModel {
    /** @inheritdoc */
    placeholders: {
        id_generator: string,
        id_generator_path: ImportRelativePath
    }
}

export class UuidGeneratorTemplateGenerator extends TemplateConsumer<UuidGeneratorTemplate> {

    constructor() {
        super({
            filePath: "uuid-generator.ts",
            templatePath: "./common/data-layer/uuid-generator"
        })
    }

    async processTemplate(): Promise<LayerArtifact> {

        const idGeneratorInterface = await IdGeneratorInterfaceGenerator.processTemplate();

        const uuidGeneratorTemplate: UuidGeneratorTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                id_generator: idGeneratorInterface.exportedObjectName,
                id_generator_path: {
                    from: this._filePath,
                    to: idGeneratorInterface.filePath
                }
            }
        }

        const uuidGeneratorRender = this._templateRenderer.renderTemplate(uuidGeneratorTemplate);

        const uuidGeneratorArtifact: LayerArtifact = {
            exportedObjectName: "UUIDGenerator",
            filePath: this._filePath,
            sourceText: uuidGeneratorRender,
            dependencies: [idGeneratorInterface]
        }

        return uuidGeneratorArtifact;
    }
}