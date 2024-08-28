import { InstanceResultReturnInterfaceGenerator } from "../../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../../../../templates/template-consumer";
import { GeneratedFilePathCalculator } from "../../../../utils/artifact-saver";
import { DetailReaderInterfaceGenerator } from "../../reader-interface-generator";
import { InstanceDetailLdkitReaderTemplate } from "./instance-detail-reader-template";

interface InstanceDetailLdkitReaderDependencyMap extends TemplateDependencyMap {
    aggregateHumanLabel: string;
    pathResolver: GeneratedFilePathCalculator,
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: string
}

export class InstanceDetailLdkitReaderGenerator extends TemplateConsumer<InstanceDetailLdkitReaderTemplate> {

    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    private getReaderInterfaceReturnTypeName(readerInterfaceArtifact: LayerArtifact): LayerArtifact {
        if (!readerInterfaceArtifact.dependencies || readerInterfaceArtifact.dependencies.length === 0) {
            throw new Error("Reader interface expects at least one dependency artifact - return type of the read function.");
        }

        let instanceReturnTypeArtifact = readerInterfaceArtifact.dependencies.find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!instanceReturnTypeArtifact) {
            instanceReturnTypeArtifact = InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        return instanceReturnTypeArtifact;
    }

    processTemplate(dependencies: InstanceDetailLdkitReaderDependencyMap): LayerArtifact {

        const instanceReaderInterfaceArtifact = DetailReaderInterfaceGenerator.processTemplate();
        const instanceReturnTypeArtifact = this.getReaderInterfaceReturnTypeName(instanceReaderInterfaceArtifact);

        const instanceLdkitReaderTemplate: InstanceDetailLdkitReaderTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregateHumanLabel,
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
                    to: instanceReaderInterfaceArtifact.filePath
                },
                ldkit_schema_path: {
                    from: this._filePath,
                    to: dependencies.ldkitSchemaArtifact.filePath
                }
            }
        }

        const ldkitInstanceDetailReader: string = this._templateRenderer.renderTemplate(instanceLdkitReaderTemplate);

        const readerInterfaceArtifact: LayerArtifact = {
            sourceText: ldkitInstanceDetailReader,
            exportedObjectName: `${dependencies.aggregateHumanLabel}LdkitInstanceReader`,
            filePath: this._filePath,
            dependencies: [instanceReaderInterfaceArtifact]
        }

        return readerInterfaceArtifact;
    }
}