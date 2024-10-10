import { InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../../../engine/templates/template-consumer";
import { GeneratedFilePathCalculator } from "../../../utils/artifact-saver";
import { InstanceCreatorInterfaceGenerator } from "../reader-interface-generator";
import { ImportRelativePath, DataLayerTemplateDescription } from "../../../engine/templates/template-interfaces";

export interface EditLdkitInstanceTemplate extends DataLayerTemplateDescription {
    placeholders: {
        aggregate_name: string,
        exported_object_name: string,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        ldkit_endpoint_uri: string,
        instance_result_type: string,
        instance_result_type_path: ImportRelativePath,
        editor_interface_type: string,
        editor_interface_type_path: ImportRelativePath
    }
}

interface EditLdkitInstanceDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator,
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: string
}

export class EditLdkitInstanceGenerator extends TemplateConsumer<EditLdkitInstanceTemplate> {

    private static readonly _editInstanceLdkitDataLayerTemplatePath = "./edit/data-layer/ldkit/instance-editor";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: EditLdkitInstanceGenerator._editInstanceLdkitDataLayerTemplatePath
        });
    }

    async processTemplate(dependencies: EditLdkitInstanceDependencyMap): Promise<LayerArtifact> {

        // TODO: change to update
        const editInterfaceArtifact = await InstanceCreatorInterfaceGenerator.processTemplate();

        if (!editInterfaceArtifact || !editInterfaceArtifact.dependencies) {
            throw new Error("At least one interface dependency is expected");
        }

        let editReturnTypeArtifact = editInterfaceArtifact
            .dependencies
            .find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!editReturnTypeArtifact) {
            editReturnTypeArtifact = await InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const editExportedObject = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "LdkitInstanceEditor"
        });

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
                ldkit_endpoint_uri: `"${dependencies.sparqlEndpointUri}"`,
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
            dependencies: [editInterfaceArtifact]
        }

        return createDalLayerArtifact;
    }
}``