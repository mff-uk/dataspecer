import { LayerArtifact } from "../../../engine/layer-artifact.ts";
import { InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator.ts";
import { ImportRelativePath, DataLayerTemplateDescription } from "../../../engine/templates/template-interfaces.ts";
import { DeleteInstanceMutatorInterfaceGenerator } from "../reader-interface-generator.ts";
import { TemplateConsumer } from "../../../engine/templates/template-consumer.ts";
import { LdkitDalDependencyMap } from "../../strategies/ldkit-template-strategy.ts";
import { ReadWriteEndpointUri } from "../../../engine/graph/datasource.ts";

export interface InstanceDeleteLdkitTemplate extends DataLayerTemplateDescription {
    placeholders: {
        aggregate_name: string,
        exported_object_name: string;
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        sparql_endpoint_uri: ReadWriteEndpointUri,
        instance_result_type: string,
        instance_result_type_path: ImportRelativePath,
        delete_mutator_interface_type: string,
        delete_mutator_interface_type_path: ImportRelativePath
    }
}

export class InstanceDeleteLdkitGenerator extends TemplateConsumer<InstanceDeleteLdkitTemplate> {

    private static readonly _deleteLdkitInstanceDataLayerTemplatePath: string = "./delete/data-layer/ldkit/instance-delete-mutator";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: InstanceDeleteLdkitGenerator._deleteLdkitInstanceDataLayerTemplatePath
        });
    }

    async processTemplate(dependencies: LdkitDalDependencyMap): Promise<LayerArtifact> {

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

        const sparqlEndpointUri: ReadWriteEndpointUri = typeof dependencies.sparqlEndpointUri === "string"
            ? {
                read: dependencies.sparqlEndpointUri,
                write: dependencies.sparqlEndpointUri
            } as ReadWriteEndpointUri
            : dependencies.sparqlEndpointUri;

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
                sparql_endpoint_uri: sparqlEndpointUri,
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