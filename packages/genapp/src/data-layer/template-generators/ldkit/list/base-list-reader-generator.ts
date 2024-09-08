import { LayerArtifact } from "../../../../engine/layer-artifact";
import { BaseLdkitReaderTemplate } from "./base-ldkit-reader-template";
import { TemplateConsumer, TemplateDependencyMap } from "../../../../templates/template-consumer";
import { ListReaderInterfaceGenerator } from "../../reader-interface-generator";
import { ListResultReturnInterfaceGenerator } from "../../../../capabilities/template-generators/capability-interface-generator";

export class BaseListLdkitReaderGenerator extends TemplateConsumer<BaseLdkitReaderTemplate> {

    constructor() {
        super({
            filePath: "./readers/ldkit/base-list-reader-implementation.ts",
            templatePath: "./list/data-layer/ldkit/base-reader"
        });
    }

    async processTemplate(dependencies?: TemplateDependencyMap): Promise<LayerArtifact> {
        const readerInterfaceArtifact = await ListReaderInterfaceGenerator.processTemplate();

        if (!readerInterfaceArtifact.dependencies || readerInterfaceArtifact.dependencies.length === 0) {
            throw new Error("Reader interface expectes at least one dependency artifact - return type of the read function.");
        }

        let listReturnTypeArtifact = readerInterfaceArtifact.dependencies.find(artifact => artifact.exportedObjectName === "ListResult");

        if (!listReturnTypeArtifact) {
            listReturnTypeArtifact = await ListResultReturnInterfaceGenerator.processTemplate();
        }

        const baseLdkitReaderTemplate: BaseLdkitReaderTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                list_reader_interface: readerInterfaceArtifact.exportedObjectName,
                list_reader_interface_path: {
                    from: this._filePath,
                    to: readerInterfaceArtifact.filePath
                },
                list_result_interface: listReturnTypeArtifact.exportedObjectName,
                list_result_interface_path: {
                    from: this._filePath,
                    to: listReturnTypeArtifact.filePath
                }
            }
        }

        const baseLdkitReaderRender = this._templateRenderer.renderTemplate(baseLdkitReaderTemplate);

        const result: LayerArtifact = {
            exportedObjectName: "LdkitListReader",
            filePath: this._filePath,
            sourceText: baseLdkitReaderRender,
            dependencies: [readerInterfaceArtifact, listReturnTypeArtifact]
        }

        return result;
    }
}