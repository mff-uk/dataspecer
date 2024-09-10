import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../../../../engine/template-consumer";
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

    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    async processTemplate(dependencies: LdkitInstanceDeleteMutatorDependencyMap): Promise<LayerArtifact> {

        const deleteMutatorInterfaceArtifact = await DeleteInstanceMutatorInterfaceGenerator.processTemplate();

        if (!deleteMutatorInterfaceArtifact || !deleteMutatorInterfaceArtifact.dependencies) {
            throw new Error("At least one interface dependency is expected");
        }

        let deleteReturnTypeArtifact = deleteMutatorInterfaceArtifact
            .dependencies
            .find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!deleteReturnTypeArtifact) {
            deleteReturnTypeArtifact = await InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const deleteTemplate: InstanceDeleteLdkitTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregateHumanLabel,
                delete_mutator_interface_type: deleteMutatorInterfaceArtifact.exportedObjectName,
                delete_mutator_interface_type_path: {
                    from: this._filePath,
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
            exportedObjectName: `${dependencies.aggregateHumanLabel}LdkitInstanceDeleteMutator`,
            filePath: this._filePath,
            sourceText: deleteInstanceRender,
            dependencies: [deleteMutatorInterfaceArtifact]
        }

        return deleteDalLayerArtifact;
    }
}