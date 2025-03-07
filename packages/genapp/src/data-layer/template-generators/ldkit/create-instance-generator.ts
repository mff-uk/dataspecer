import { InstanceResultReturnInterfaceGenerator, LdkitWriterQueryEngineGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer } from "../../../engine/templates/template-consumer";
import { InstanceCreatorInterfaceGenerator } from "../reader-interface-generator";
import { DataLayerTemplateDescription, ImportRelativePath } from "../../../engine/templates/template-interfaces";
import { LdkitDalDependencyMap } from "../../strategies/ldkit-template-strategy";
import { ReadWriteEndpointUri } from "../../../engine/graph/datasource";
import { IriIdentifierTemplateGenerator } from "./iri-generator";

/**
 * Interface representing the template model for rendering the create capability template.
 *
 * @interface CreateLdkitInstanceTemplate
 */
export interface CreateLdkitInstanceTemplate extends DataLayerTemplateDescription {
    /** @inheritdoc */
    placeholders: {
        aggregate_name: string,
        exported_object_name: string,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        sparql_endpoint_uri: string,
        instance_result_type: string,
        instance_result_type_path: ImportRelativePath,
        creator_interface_type: string,
        creator_interface_type_path: ImportRelativePath,
        writer_query_engine: string,
        writer_query_engine_path: ImportRelativePath,
        iri_generator: string,
        iri_generator_path: ImportRelativePath
    }
}

/**
 * The `CreateLdkitInstanceGenerator` class is responsible for generating the implementation of the instance creation capability
 * using the LDkit library. This class provides specific logic for template population and generation of dependencies needed
 * for the data layer of the instance creation capability of the generated application.
 *
 * @extends TemplateConsumer<CreateLdkitInstanceTemplate>
 */
export class CreateLdkitInstanceGenerator extends TemplateConsumer<CreateLdkitInstanceTemplate> {

    private static readonly _createLdkitInstanceDataLayerTemplatePath: string = "./create/data-layer/ldkit/instance-creator";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: CreateLdkitInstanceGenerator._createLdkitInstanceDataLayerTemplatePath
        });
    }

    /**
     * This method is responsible for the population and rendering of the template for create capability implementation.
     * After all dependencies needed by template (@see {CreateLdkitInstanceTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting code.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A promise that resolves to the artifact which contains generated implementation for instance creation capability.
     * @throws An error if the creator interface artifact or its dependencies are not found or valid.
     */
    async processTemplate(dependencies: LdkitDalDependencyMap): Promise<LayerArtifact> {

        const creatorInterfaceArtifact = await InstanceCreatorInterfaceGenerator.processTemplate();
        const ldkitWriterQueryEngine = await LdkitWriterQueryEngineGenerator.processTemplate();
        const iriGenerator = await new IriIdentifierTemplateGenerator().processTemplate();

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
                },
                writer_query_engine: ldkitWriterQueryEngine.exportedObjectName,
                writer_query_engine_path: {
                    from: this._filePath,
                    to: ldkitWriterQueryEngine.filePath
                },
                iri_generator: iriGenerator.exportedObjectName,
                iri_generator_path: {
                    from: this._filePath,
                    to: iriGenerator.filePath
                }
            }
        };

        const createInstanceRender = this._templateRenderer.renderTemplate(createTemplate);

        const createDalLayerArtifact: LayerArtifact = {
            exportedObjectName: createExportedObject,
            filePath: this._filePath,
            sourceText: createInstanceRender,
            dependencies: [creatorInterfaceArtifact, dependencies.ldkitSchemaInterfaceArtifact, ldkitWriterQueryEngine, iriGenerator]
        }

        return createDalLayerArtifact;
    }
}