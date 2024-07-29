import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../../../../templates/template-consumer";
import { LayerArtifact } from "../../../../engine/layer-artifact";
import { GeneratedFilePathCalculator } from "../../../../utils/artifact-saver";
import { InstanceDeleteLdkitTemplate } from "./instance-delete-template";
import { DeleteInstanceMutatorInterfaceGenerator } from "../../reader-interface-generator";
import { InstanceResultReturnInterfaceGenerator } from "../../../../capabilities/template-generators/capability-interface-generator";

interface LdkitInstanceDeleteMutatorDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator,
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: string
}

export class InstanceDeleteLdkitGenerator extends TemplateConsumer<InstanceDeleteLdkitTemplate> {

    private readonly _aggregateName: string;

    constructor({ templatePath, filePath, aggregateName }: TemplateMetadata & { aggregateName: string }) {
        super({
            templatePath,
            filePath
        });
        this._aggregateName = aggregateName;
    }

    processTemplate(dependencies: LdkitInstanceDeleteMutatorDependencyMap): LayerArtifact {

        const deleteMutatorInterfaceArtifact = DeleteInstanceMutatorInterfaceGenerator.processTemplate();

        if (!deleteMutatorInterfaceArtifact || !deleteMutatorInterfaceArtifact.dependencies) {
            throw new Error("At least one interface dependency is expected");
        }

        let deleteReturnTypeArtifact = deleteMutatorInterfaceArtifact
            .dependencies
            .find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!deleteReturnTypeArtifact) {
            deleteReturnTypeArtifact = InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const deleteTemplate: InstanceDeleteLdkitTemplate = {
            templatePath: this._filePath,
            placeholders: {
                aggregate_name: this._aggregateName,
                delete_mutator_interface_type: deleteMutatorInterfaceArtifact.exportedObjectName,
                delete_mutator_interface_type_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: deleteMutatorInterfaceArtifact.filePath
                },
                instance_result_type: deleteReturnTypeArtifact.exportedObjectName,
                instance_result_type_path: {
                    from: this._filePath,
                    to: deleteReturnTypeArtifact.filePath
                },
                ldkit_endpoint_uri: `"${dependencies.sparqlEndpointUri}"`,
                ldkit_schema: dependencies.ldkitSchemaArtifact.exportedObjectName,
                ldkit_schema_path: {
                    from: this._filePath,
                    to: dependencies.ldkitSchemaArtifact.filePath
                }
            }
        };
        
        const deleteInstanceRender = this._templateRenderer.renderTemplate(deleteTemplate);

        const deleteDalLayerArtifact: LayerArtifact = {
            exportedObjectName: `${this._aggregateName}LdkitInstanceDeleteMutator`,
            filePath: this._filePath,
            sourceText: deleteInstanceRender,
            dependencies: [deleteMutatorInterfaceArtifact]
        }
        
        return deleteDalLayerArtifact;
    }
}