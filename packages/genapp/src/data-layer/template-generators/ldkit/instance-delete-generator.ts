import { LayerArtifact } from "../../../engine/layer-artifact";
import { GeneratedFilePathCalculator } from "../../../utils/artifact-saver";
import { InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";
import { DeleteInstanceMutatorInterfaceGenerator } from "../reader-interface-generator";
import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../../../engine/template-consumer";

interface InstanceDeleteLdkitTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string,
        exported_object_name: string;
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        ldkit_endpoint_uri: string,
        instance_result_type: string,
        instance_result_type_path: ImportRelativePath,
        delete_mutator_interface_type: string,
        delete_mutator_interface_type_path: ImportRelativePath
    }
}

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

        const exportedName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "LdkitInstanceDeleteMutator"
        });

        const deleteTemplate: InstanceDeleteLdkitTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                exported_object_name: exportedName,
                aggregate_name: dependencies.aggregate.getAggregateNamePascalCase(),
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
            exportedObjectName: exportedName,
            filePath: this._filePath,
            sourceText: deleteInstanceRender,
            dependencies: [deleteMutatorInterfaceArtifact]
        }

        return deleteDalLayerArtifact;
    }
}