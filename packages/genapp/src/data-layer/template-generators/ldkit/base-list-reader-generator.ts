import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../../engine/templates/template-consumer";
import { ListReaderInterfaceGenerator } from "../reader-interface-generator";
import { ListResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { TemplateModel, ImportRelativePath } from "../../../engine/templates/template-interfaces";

/**
 * Describes the template model for generating a base LDkit reader implementation.
 * Extends the TemplateModel interface.
 *
 * @interface BaseLdkitReaderTemplate
 */
export interface BaseLdkitReaderTemplate extends TemplateModel {
    /** @inheritdoc */
    templatePath: string;
    /** @inheritdoc */
    placeholders: {
        exported_object_name: string;
        list_reader_interface: string;
        list_result_interface: string;
        list_reader_interface_path: ImportRelativePath;
        list_result_interface_path: ImportRelativePath;
    };
}

/**
 * The `BaseListLdkitReaderGenerator` class is responsible for generating the base implementation
 * for the list capability which makes use of the LDkit library. To generate the artifact, this class uses
 * template population approach; therefore it extends the `TemplateConsumer` class.
 *
 * @extends TemplateConsumer<BaseLdkitReaderTemplate>
 */
export class BaseListLdkitReaderGenerator extends TemplateConsumer<BaseLdkitReaderTemplate> {

    constructor() {
        super({
            filePath: "./readers/ldkit/base-list-reader-implementation.ts",
            templatePath: "./list/data-layer/ldkit/base-reader"
        });
    }

    /**
     * This method generates the necessary artifacts - dependencies needed to populate the template which generates the base implementation for the list capability.
     * When all dependent artifacts are generated and retrieved, then base list reader template is populated and rendered.
     *
     * @param {TemplateDependencyMap} [dependencies] - Dependencies providing the information about the aggregate and context for the template.
     * @returns {Promise<LayerArtifact>} - A promise that resolves to the generated base implementation for list capability.
     * @throws {Error} - Throws an error if the reader interface artifact is not generated.
     */
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