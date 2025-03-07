import { IdGeneratorInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer } from "../../../engine/templates/template-consumer";
import { ImportRelativePath, TemplateModel } from "../../../engine/templates/template-interfaces";
import { UuidGeneratorTemplateGenerator } from "../uuid-generator";

interface IriGeneratorTemplate extends TemplateModel {
    /** @inheritdoc */
    placeholders: {
        id_generator: string,
        id_generator_path: ImportRelativePath,
        uuid_generator: string,
        uuid_generator_path: ImportRelativePath
    };
}

export class IriIdentifierTemplateGenerator extends TemplateConsumer<IriGeneratorTemplate> {

    constructor() {
        super({
            filePath: "./writers/ldkit/iri-generator.ts",
            templatePath: "./common/data-layer/ldkit/iri-generator"
        });
    }

    async processTemplate(): Promise<LayerArtifact> {

        const idGeneratorInterface = await IdGeneratorInterfaceGenerator.processTemplate();
        const uuidGenerator = await (new UuidGeneratorTemplateGenerator()).processTemplate();

        const iriGeneratorTemplate: IriGeneratorTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                id_generator: idGeneratorInterface.exportedObjectName,
                id_generator_path: {
                    from: this._filePath,
                    to: idGeneratorInterface.filePath
                },
                uuid_generator: uuidGenerator.exportedObjectName,
                uuid_generator_path: {
                    from: this._filePath,
                    to: uuidGenerator.filePath
                }
            }
        }

        const iriGeneratorRender = this._templateRenderer.renderTemplate(iriGeneratorTemplate);

        const generatorLayerArtifact: LayerArtifact = {
            exportedObjectName: "IriGenerator",
            sourceText: iriGeneratorRender,
            filePath: this._filePath,
            dependencies: [idGeneratorInterface, uuidGenerator]
        }

        return generatorLayerArtifact;
    }
}