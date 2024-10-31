import { InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer } from "../../../engine/templates/template-consumer";
import { InstanceCreatorInterfaceGenerator } from "../reader-interface-generator";
import { DataLayerTemplateDescription, ImportRelativePath } from "../../../engine/templates/template-interfaces";
import { LdkitDalDependencyMap } from "../../strategies/ldkit-template-strategy";
import { ReadWriteEndpointUri } from "../../../engine/graph/datasource";

export interface CreateLdkitInstanceTemplate extends DataLayerTemplateDescription {
    placeholders: {
        aggregate_name: string,
        exported_object_name: string,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        sparql_endpoint_uri: string,
        instance_result_type: string,
        instance_result_type_path: ImportRelativePath,
        creator_interface_type: string,
        creator_interface_type_path: ImportRelativePath
    }
}

export class CreateLdkitInstanceGenerator extends TemplateConsumer<CreateLdkitInstanceTemplate> {

    private static readonly _createLdkitInstanceDataLayerTemplatePath: string = "./create/data-layer/ldkit/instance-creator";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: CreateLdkitInstanceGenerator._createLdkitInstanceDataLayerTemplatePath
        });
    }

    async processTemplate(dependencies: LdkitDalDependencyMap): Promise<LayerArtifact> {

        const creatorInterfaceArtifact = await InstanceCreatorInterfaceGenerator.processTemplate();

        if (!creatorInterfaceArtifact || !creatorInterfaceArtifact.dependencies) {
            throw new Error("At least one interface dependency is expected");
        }

        let createReturnTypeArtifact = creatorInterfaceArtifact
            .dependencies
            .find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!createReturnTypeArtifact) {
            createReturnTypeArtifact = await InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const createExportedObject = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "LdkitInstanceCreator"
        });

        const updateSparqlEndpointUri: string = typeof dependencies.sparqlEndpointUri === "string"
                ? dependencies.sparqlEndpointUri
                : (dependencies.sparqlEndpointUri as ReadWriteEndpointUri).write;

        const createTemplate: CreateLdkitInstanceTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregate.getAggregateNamePascalCase(),
                exported_object_name: createExportedObject,
                creator_interface_type: creatorInterfaceArtifact.exportedObjectName,
                creator_interface_type_path: {
                    from: this._filePath,
                    to: creatorInterfaceArtifact.filePath
                },
                instance_result_type: createReturnTypeArtifact.exportedObjectName,
                instance_result_type_path: {
                    from: this._filePath,
                    to: createReturnTypeArtifact.filePath
                },
                sparql_endpoint_uri: `"${updateSparqlEndpointUri}"`,
                ldkit_schema: dependencies.ldkitSchemaArtifact.exportedObjectName,
                ldkit_schema_path: {
                    from: this._filePath,
                    to: dependencies.ldkitSchemaArtifact.filePath
                }
            }
        };

        const createInstanceRender = this._templateRenderer.renderTemplate(createTemplate);

        const createDalLayerArtifact: LayerArtifact = {
            exportedObjectName: createExportedObject,
            filePath: this._filePath,
            sourceText: createInstanceRender,
            dependencies: [creatorInterfaceArtifact, dependencies.ldkitSchemaInterfaceArtifact]
        }

        return createDalLayerArtifact;
    }
}