import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateMetadata } from "../../engine/templates/template-consumer";
import {
    InstanceResultReturnInterfaceGenerator,
    ListResultReturnInterfaceGenerator,
    CapabilityInterfaceGeneratorType
} from "../../capabilities/template-generators/capability-interface-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";

interface InterfaceTemplate extends TemplateModel {
    templatePath: string;
    placeholders: {
        return_type: string;
        return_type_path: ImportRelativePath;
    };
}

/**
 * The class responsible for generating an interface based on a provided interface template model.
 *
 * @extends TemplateConsumer<InterfaceTemplate>
 */
class InterfaceGenerator extends TemplateConsumer<InterfaceTemplate> {

    /**
     * The name of the interface to be generated.
     */
    private readonly _interfaceName: string;
    /**
     * Generator for the return type of the capability.
     */
    private readonly _capabilityReturnTypeGenerator: CapabilityInterfaceGeneratorType;

    constructor(templateMetadata:
        TemplateMetadata & { queryExportedObjectName: string, returnTypeInterfaceGenerator: CapabilityInterfaceGeneratorType }) {
        super({
            templatePath: templateMetadata.templatePath,
            filePath: templateMetadata.filePath
        });
        this._interfaceName = templateMetadata.queryExportedObjectName;
        this._capabilityReturnTypeGenerator = templateMetadata.returnTypeInterfaceGenerator;
    }

    /**
     * Processes the specified template to generate an artifact.
     *
     * @returns {Promise<LayerArtifact>} A promise that resolves to the generated reader interface artifact.
     */
    async processTemplate(): Promise<LayerArtifact> {

        const capabilityResultArtifact = await this._capabilityReturnTypeGenerator.processTemplate();

        const readerInterfaceTemplate: InterfaceTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                return_type: capabilityResultArtifact.exportedObjectName,
                return_type_path: {
                    from: this._filePath,
                    to: capabilityResultArtifact.filePath
                }
            }
        };

        const interfaceRender: string = this._templateRenderer.renderTemplate(readerInterfaceTemplate);

        const interfaceArtifact: LayerArtifact = {
            sourceText: interfaceRender,
            exportedObjectName: this._interfaceName,
            filePath: this._filePath,
            dependencies: [capabilityResultArtifact]
        }

        return interfaceArtifact;
    }
}

/**
 * An `InterfaceGenerator` instance which generates the `ListReader` interface.
 *
 * @type {InterfaceGenerator}
 * @property {string} filePath - The path to the file where the generated `ListReader` interface will be saved.
 * @property {string} templatePath - The path to the template used for the interface generation.
 * @property {string} queryExportedObjectName - The name of the interface which will be used by dependent artifacts to reference this interface.
 * @property {InterfaceGenerator} returnTypeInterfaceGenerator - The generator used to define the specific return type of the interface.
 */
export const ListReaderInterfaceGenerator = new InterfaceGenerator({
    filePath: "./readers/list-reader.ts",
    templatePath: "./list/data-layer/reader-interface",
    queryExportedObjectName: "ListReader",
    returnTypeInterfaceGenerator: ListResultReturnInterfaceGenerator
})

export const DetailReaderInterfaceGenerator = new InterfaceGenerator({
    filePath: "./readers/instance-reader.ts",
    templatePath: "./detail/data-layer/reader-interface",
    queryExportedObjectName: "InstanceDetailReader",
    returnTypeInterfaceGenerator: InstanceResultReturnInterfaceGenerator
})

export const DeleteInstanceMutatorInterfaceGenerator = new InterfaceGenerator({
    filePath: "./writers/instance-delete-mutator.ts",
    queryExportedObjectName: "AggregateInstanceDeleteMutator",
    templatePath: "./delete/data-layer/instance-delete-interface",
    returnTypeInterfaceGenerator: InstanceResultReturnInterfaceGenerator
})

export const InstanceCreatorInterfaceGenerator = new InterfaceGenerator({
    filePath: "./writers/instance-creator.ts",
    queryExportedObjectName: "AggregateInstanceCreator",
    templatePath: "./create/data-layer/instance-create-interface",
    returnTypeInterfaceGenerator: InstanceResultReturnInterfaceGenerator
})

export const InstanceEditorInterfaceGenerator = new InterfaceGenerator({
    filePath: "./writers/instance-editor.ts",
    queryExportedObjectName: "AggregateInstanceEditor",
    templatePath: "./edit/data-layer/edit-instance-interface",
    returnTypeInterfaceGenerator: InstanceResultReturnInterfaceGenerator
})