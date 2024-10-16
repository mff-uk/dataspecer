import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateMetadata } from "../../engine/templates/template-consumer";
import {
    InstanceResultReturnInterfaceGenerator,
    ListResultReturnInterfaceGenerator,
    CapabilityInterfaceGeneratorType
} from "../../capabilities/template-generators/capability-interface-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";

// TODO: Change / use more generic interfaceTemplate and placeholder names (e.g. InterfaceTemplate and return_type)
interface ReaderInterfaceTemplate extends TemplateModel {
    templatePath: string;
    placeholders: {
        read_return_type: string;
        read_return_type_path: ImportRelativePath;
    };
}

// TODO: Change interface name
class ReaderInterfaceGenerator extends TemplateConsumer<ReaderInterfaceTemplate> {

    private readonly _readerInterfaceName: string;
    private readonly _capabilityReturnTypeGenerator: CapabilityInterfaceGeneratorType;

    constructor(templateMetadata:
        TemplateMetadata & { queryExportedObjectName: string, listReturnTypeInterfaceGenerator: CapabilityInterfaceGeneratorType }) {
        super({
            templatePath: templateMetadata.templatePath,
            filePath: templateMetadata.filePath
        });
        this._readerInterfaceName = templateMetadata.queryExportedObjectName;
        this._capabilityReturnTypeGenerator = templateMetadata.listReturnTypeInterfaceGenerator;
    }

    async processTemplate(): Promise<LayerArtifact> {

        const capabilityResultArtifact = await this._capabilityReturnTypeGenerator.processTemplate();

        const readerInterfaceTemplate: ReaderInterfaceTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                read_return_type: capabilityResultArtifact.exportedObjectName,
                read_return_type_path: {
                    from: this._filePath,
                    to: capabilityResultArtifact.filePath
                }
            }
        };

        const readerInterfaceRender: string = this._templateRenderer.renderTemplate(readerInterfaceTemplate);

        const readerInterfaceArtifact: LayerArtifact = {
            sourceText: readerInterfaceRender,
            exportedObjectName: this._readerInterfaceName,
            filePath: this._filePath, //this.getThisArtifactFilepath(this._readerInterfaceName),
            dependencies: [capabilityResultArtifact]
        }

        return readerInterfaceArtifact;
    }
}

export const ListReaderInterfaceGenerator = new ReaderInterfaceGenerator({
    filePath: "./readers/list-reader.ts",
    templatePath: "./list/data-layer/reader-interface",
    queryExportedObjectName: "ListReader",
    listReturnTypeInterfaceGenerator: ListResultReturnInterfaceGenerator
})

export const DetailReaderInterfaceGenerator = new ReaderInterfaceGenerator({
    filePath: "./readers/instance-reader.ts",
    templatePath: "./detail/data-layer/reader-interface",
    queryExportedObjectName: "InstanceDetailReader",
    listReturnTypeInterfaceGenerator: InstanceResultReturnInterfaceGenerator
})

// TODO: Change name of interface generator
export const DeleteInstanceMutatorInterfaceGenerator = new ReaderInterfaceGenerator({
    filePath: "./writers/instance-delete-mutator.ts",
    queryExportedObjectName: "AggregateInstanceDeleteMutator",
    templatePath: "./delete/data-layer/instance-delete-interface",
    listReturnTypeInterfaceGenerator: InstanceResultReturnInterfaceGenerator
})

export const InstanceCreatorInterfaceGenerator = new ReaderInterfaceGenerator({
    filePath: "./writers/instance-creator.ts",
    queryExportedObjectName: "AggregateInstanceCreator",
    templatePath: "./create/data-layer/instance-create-interface",
    listReturnTypeInterfaceGenerator: InstanceResultReturnInterfaceGenerator
})

export const InstanceEditorInterfaceGenerator = new ReaderInterfaceGenerator({
    filePath: "./writers/instance-editor.ts",
    queryExportedObjectName: "AggregateInstanceEditor",
    templatePath: "./edit/data-layer/edit-instance-interface",
    listReturnTypeInterfaceGenerator: InstanceResultReturnInterfaceGenerator
})