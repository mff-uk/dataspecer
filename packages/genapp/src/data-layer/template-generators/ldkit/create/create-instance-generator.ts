import { InstanceResultReturnInterfaceGenerator } from "../../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../../../../engine/template-consumer";
import { GeneratedFilePathCalculator } from "../../../../utils/artifact-saver";
import { InstanceCreatorInterfaceGenerator } from "../../reader-interface-generator";
import { CreateLdkitInstanceTemplate } from "./create-instance-template";

interface CreateLdkitInstanceDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator,
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: string
}

export class CreateLdkitInstanceGenerator extends TemplateConsumer<CreateLdkitInstanceTemplate> {

    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    async processTemplate(dependencies: CreateLdkitInstanceDependencyMap): Promise<LayerArtifact> {

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
                ldkit_endpoint_uri: `"${dependencies.sparqlEndpointUri}"`,
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
            dependencies: [creatorInterfaceArtifact]
        }

        return createDalLayerArtifact;
    }
}