import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../../engine/template-consumer";
import { ListReaderInterfaceGenerator } from "../reader-interface-generator";
import { ListResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { TemplateDescription, ImportRelativePath } from "../../../engine/eta-template-renderer";

export interface BaseLdkitReaderTemplate extends TemplateDescription {
    templatePath: string;
    placeholders: {
        exported_object_name: string;
        list_reader_interface: string;
        list_result_interface: string;
        list_reader_interface_path: ImportRelativePath;
        list_result_interface_path: ImportRelativePath;
    };
}

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

        const exportObjectName = "LdkitListReader";

        const baseLdkitReaderTemplate: BaseLdkitReaderTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                exported_object_name: exportObjectName,
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

        const baseLdkitReaderArtifact: LayerArtifact = {
            exportedObjectName: exportObjectName,
            filePath: this._filePath,
            sourceText: baseLdkitReaderRender,
            dependencies: [readerInterfaceArtifact, listReturnTypeArtifact]
        }

        return baseLdkitReaderArtifact;
    }
}