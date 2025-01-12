import { LayerArtifact } from "../../../engine/layer-artifact";
import { InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { ImportRelativePath, DataLayerTemplateDescription } from "../../../engine/templates/template-interfaces";
import { DeleteInstanceMutatorInterfaceGenerator } from "../reader-interface-generator";
import { TemplateConsumer } from "../../../engine/templates/template-consumer";
import { LdkitDalDependencyMap } from "../../strategies/ldkit-template-strategy";
import { ReadWriteEndpointUri } from "../../../engine/graph/datasource";

/**
 * Interface representing the template model for rendering the deletion capability template.
 *
 * @interface InstanceDeleteLdkitTemplate
 */
export interface InstanceDeleteLdkitTemplate extends DataLayerTemplateDescription {
    /** @inheritdoc */
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

/**
 * The `InstanceDeleteLdkitGenerator` class is responsible for generating the implementation of the instance deletion capability
 * using the LDkit library. This class provides specific logic for template population and generation of dependencies needed
 * for the data layer of the instance deletion capability of the generated application.
 *
 * @extends TemplateConsumer<InstanceDeleteLdkitTemplate>
 */
export class InstanceDeleteLdkitGenerator extends TemplateConsumer<InstanceDeleteLdkitTemplate> {

    private static readonly _deleteLdkitInstanceDataLayerTemplatePath: string = "./delete/data-layer/ldkit/instance-delete-mutator";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: InstanceDeleteLdkitGenerator._deleteLdkitInstanceDataLayerTemplatePath
        });
    }

    /**
     * This method is responsible for the population and rendering of the template for instance deletion capability implementation.
     * After all dependencies needed by template (@see {InstanceDeleteLdkitTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting code.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A promise that resolves to the artifact which contains generated implementation for instance deletion capability.
     * @throws An error if the deletion interface artifact or its dependencies are not found or valid.
     */
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