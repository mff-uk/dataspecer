import { InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer } from "../../../engine/templates/template-consumer";
import { ReadWriteEndpointUri } from "../../../engine/graph/datasource";
import { InstanceEditorInterfaceGenerator } from "../reader-interface-generator";
import { ImportRelativePath, DataLayerTemplateDescription } from "../../../engine/templates/template-interfaces";
import { LdkitDalDependencyMap } from "../../strategies/ldkit-template-strategy";

/**
 * Interface representing the template model for rendering the edit capability template.
 *
 * @interface EditLdkitInstanceTemplate
 */
export interface EditLdkitInstanceTemplate extends DataLayerTemplateDescription {
    /** @inheritdoc */
    placeholders: {
        aggregate_name: string,
        exported_object_name: string,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        sparql_endpoint_uri: ReadWriteEndpointUri,
        instance_result_type: string,
        instance_result_type_path: ImportRelativePath,
        editor_interface_type: string,
        editor_interface_type_path: ImportRelativePath
    }
}

/**
 * The `EditLdkitInstanceGenerator` class is responsible for generating the implementation of the instance edit capability
 * using the LDkit library. This class provides specific logic for template population and generation of dependencies needed
 * for the data layer of the instance edit capability of the generated application.
 *
 * @extends TemplateConsumer<EditLdkitInstanceTemplate>
 */
export class EditLdkitInstanceGenerator extends TemplateConsumer<EditLdkitInstanceTemplate> {

    private static readonly _editInstanceLdkitDataLayerTemplatePath = "./edit/data-layer/ldkit/instance-editor";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: EditLdkitInstanceGenerator._editInstanceLdkitDataLayerTemplatePath
        });
    }

    /**
     * This method is responsible for the population and rendering of the template for edit capability implementation.
     * After all dependencies needed by template (@see {EditLdkitInstanceTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting code.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A promise that resolves to the artifact which contains generated implementation for instance edit capability.
     * @throws An error if the edit interface artifact or its dependencies are not found or valid.
     */
    async processTemplate(dependencies: LdkitDalDependencyMap): Promise<LayerArtifact> {

        const editInterfaceArtifact = await InstanceEditorInterfaceGenerator.processTemplate();

        if (!editInterfaceArtifact || !editInterfaceArtifact.dependencies) {
            throw new Error("At least one interface dependency is expected");
        }

        let editReturnTypeArtifact = editInterfaceArtifact
            .dependencies
            .find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!editReturnTypeArtifact) {
            editReturnTypeArtifact = await InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const editExportedObject = dependencies.aggregate.getAggregateNamePascalCase({ suffix: "LdkitInstanceEditor" });

        const sparqlUpdateEndpointUri: ReadWriteEndpointUri = typeof dependencies.sparqlEndpointUri === "string"
            ? {
                read: dependencies.sparqlEndpointUri,
                write: dependencies.sparqlEndpointUri
            } as ReadWriteEndpointUri
            : dependencies.sparqlEndpointUri

        const editInstanceTemplate: EditLdkitInstanceTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregate.getAggregateNamePascalCase(),
                exported_object_name: editExportedObject,
                editor_interface_type: editInterfaceArtifact.exportedObjectName,
                editor_interface_type_path: {
                    from: this._filePath,
                    to: editInterfaceArtifact.filePath
                },
                instance_result_type: editReturnTypeArtifact.exportedObjectName,
                instance_result_type_path: {
                    from: this._filePath,
                    to: editReturnTypeArtifact.filePath
                },
                sparql_endpoint_uri: sparqlUpdateEndpointUri,
                ldkit_schema: dependencies.ldkitSchemaArtifact.exportedObjectName,
                ldkit_schema_path: {
                    from: this._filePath,
                    to: dependencies.ldkitSchemaArtifact.filePath
                }
            }
        };

        const createInstanceRender = this._templateRenderer.renderTemplate(editInstanceTemplate);

        const createDalLayerArtifact: LayerArtifact = {
            exportedObjectName: editExportedObject,
            filePath: this._filePath,
            sourceText: createInstanceRender,
            dependencies: [editInterfaceArtifact, dependencies.ldkitSchemaInterfaceArtifact]
        }

        return createDalLayerArtifact;
    }
}