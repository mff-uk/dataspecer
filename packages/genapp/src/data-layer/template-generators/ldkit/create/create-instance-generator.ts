import { InstanceResultReturnInterfaceGenerator } from "../../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../../../../templates/template-consumer";
import { GeneratedFilePathCalculator } from "../../../../utils/artifact-saver";
import { InstanceCreatorInterfaceGenerator } from "../../reader-interface-generator";
import { CreateLdkitInstanceTemplate } from "./create-instance-template";

interface CreateLdkitInstanceDependencyMap extends TemplateDependencyMap {
    // TODO: Change to human label aggregate name identifier (without spaces pascal camel case)
    aggregateHumanLabel: string,
    pathResolver: GeneratedFilePathCalculator,
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: string
}

export class CreateLdkitInstanceGenerator extends TemplateConsumer<CreateLdkitInstanceTemplate> {

    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    processTemplate(dependencies: CreateLdkitInstanceDependencyMap): LayerArtifact {

        const creatorInterfaceArtifact = InstanceCreatorInterfaceGenerator.processTemplate();

        if (!creatorInterfaceArtifact || !creatorInterfaceArtifact.dependencies) {
            throw new Error("At least one interface dependency is expected");
        }

        let createReturnTypeArtifact = creatorInterfaceArtifact
            .dependencies
            .find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!createReturnTypeArtifact) {
            createReturnTypeArtifact = InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const createTemplate: CreateLdkitInstanceTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregateHumanLabel,
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
            exportedObjectName: `${dependencies.aggregateHumanLabel}LdkitInstanceCreator`,
            filePath: this._filePath,
            sourceText: createInstanceRender,
            dependencies: [creatorInterfaceArtifact]
        }

        return createDalLayerArtifact;
    }
}