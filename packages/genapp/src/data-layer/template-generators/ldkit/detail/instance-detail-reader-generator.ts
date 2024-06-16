import { InstanceResultReturnInterfaceGenerator } from "../../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../../../../templates/template-consumer";
import { DetailReaderInterfaceGenerator } from "../../reader-interface-generator";
import { InstanceDetailLdkitReaderTemplate } from "./instance-detail-reader-template";

interface InstanceDetailLdkitReaderDependencyMap extends TemplateDependencyMap {
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: string
}

export class InstanceDetailLdkitReaderGenerator extends TemplateConsumer<InstanceDetailLdkitReaderTemplate> {

    private readonly _aggregateName: string;

    constructor({ templatePath, filePath, aggregateName }: TemplateMetadata & { aggregateName: string }) {
        super({
            templatePath,
            filePath
        });

        if (!aggregateName || aggregateName === "") {
            throw new Error(`Invalid aggregate name argument: "${aggregateName}"`);
        }

        this._aggregateName = aggregateName;
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
                aggregate_name: this._aggregateName,
                ldkit_schema: dependencies.ldkitSchemaArtifact.exportedObjectName,
                ldkit_endpoint_uri: `"${dependencies.sparqlEndpointUri}"`,
                ldkit_instance_reader: instanceReaderInterfaceArtifact.exportedObjectName,
                instance_result_type: instanceReturnTypeArtifact.exportedObjectName,
                ldkit_instance_reader_path: {
                    from: this._filePath,
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
            exportedObjectName: `${this._aggregateName}LdkitInstanceReader`,
            filePath: this._filePath,
            dependencies: [instanceReaderInterfaceArtifact]
        }

        return readerInterfaceArtifact;
    }
}