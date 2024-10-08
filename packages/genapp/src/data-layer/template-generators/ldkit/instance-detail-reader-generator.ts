import { InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../../../engine/template-consumer";
import { GeneratedFilePathCalculator } from "../../../utils/artifact-saver";
import { DetailReaderInterfaceGenerator } from "../reader-interface-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";

interface InstanceDetailLdkitReaderDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator,
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: string,
    ldkitSchemaInterfaceArtifact: LayerArtifact
}

export interface InstanceDetailLdkitReaderTemplate extends TemplateDescription {
    placeholders: {
        ldkit_instance_reader: string,
        exported_name_object: string;
        ldkit_instance_reader_path: ImportRelativePath,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        aggregate_name: string,
        instance_result_type: string,
        instance_result_type_path: ImportRelativePath,
        ldkit_endpoint_uri: string
    };
}

export class InstanceDetailLdkitReaderGenerator extends TemplateConsumer<InstanceDetailLdkitReaderTemplate> {

    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    private async getReaderInterfaceReturnTypeName(readerInterfaceArtifact: LayerArtifact): Promise<LayerArtifact> {
        if (!readerInterfaceArtifact.dependencies || readerInterfaceArtifact.dependencies.length === 0) {
            throw new Error("Reader interface expects at least one dependency artifact - return type of the read function.");
        }

        let instanceReturnTypeArtifact = readerInterfaceArtifact.dependencies.find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!instanceReturnTypeArtifact) {
            instanceReturnTypeArtifact = await InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        return instanceReturnTypeArtifact;
    }

    async processTemplate(dependencies: InstanceDetailLdkitReaderDependencyMap): Promise<LayerArtifact> {

        const instanceReaderInterfaceArtifact = await DetailReaderInterfaceGenerator.processTemplate();
        const instanceReturnTypeArtifact = await this.getReaderInterfaceReturnTypeName(instanceReaderInterfaceArtifact);
        const detailExportedObject = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "LdkitInstanceReader"
        });

        const instanceLdkitReaderTemplate: InstanceDetailLdkitReaderTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregate.getAggregateNamePascalCase(),
                exported_name_object: detailExportedObject,
                ldkit_schema: dependencies.ldkitSchemaArtifact.exportedObjectName,
                ldkit_endpoint_uri: `"${dependencies.sparqlEndpointUri}"`,
                ldkit_instance_reader: instanceReaderInterfaceArtifact.exportedObjectName,
                instance_result_type: instanceReturnTypeArtifact.exportedObjectName,
                instance_result_type_path: {
                    from: this._filePath,
                    to: instanceReturnTypeArtifact.filePath
                },
                ldkit_instance_reader_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.pathResolver.getFullSavePath(
                        instanceReaderInterfaceArtifact.filePath,
                        instanceReaderInterfaceArtifact.exportedObjectName
                    )
                },
                ldkit_schema_path: {
                    from: this._filePath,
                    to: dependencies.ldkitSchemaArtifact.filePath
                }
            }
        }

        console.log("INTERFACE PATH: ", instanceLdkitReaderTemplate.placeholders.ldkit_instance_reader_path);
        console.log("FULL COMPUTED: ", dependencies.pathResolver.getFullSavePath(this._filePath));

        const ldkitInstanceDetailReader: string = this._templateRenderer.renderTemplate(instanceLdkitReaderTemplate);

        const readerInterfaceArtifact: LayerArtifact = {
            sourceText: ldkitInstanceDetailReader,
            exportedObjectName: detailExportedObject,
            filePath: this._filePath,
            dependencies: [instanceReaderInterfaceArtifact, dependencies.ldkitSchemaArtifact, dependencies.ldkitSchemaInterfaceArtifact]
        }

        return readerInterfaceArtifact;
    }
}