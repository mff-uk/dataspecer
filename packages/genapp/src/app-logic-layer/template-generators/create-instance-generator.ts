import { GeneratedCapabilityInterfaceGenerator, InstanceResultReturnInterfaceGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { InstanceCreatorInterfaceGenerator } from "../../data-layer/template-generators/reader-interface-generator";
import { LayerArtifact } from "../../engine/layer-artifact";
import { ApplicationLayerTemplateDependencyMap, ApplicationLayerTemplateGenerator } from "./template-app-layer-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";

/**
 * Interface which represents the template model for rendering the creation capability template within the application layer.
 */
interface CreateInstanceCapabilityAppLayerTemplate extends TemplateModel {
    /** @inheritdoc */
    placeholders: {
        exported_object_name: string;
        instance_creator_type: string;
        instance_creator_type_path: ImportRelativePath;
        creator_interface_type: string;
        creator_interface_type_path: ImportRelativePath;
        generated_capability_class: string;
        read_return_type: string;
        read_return_type_path: ImportRelativePath;
    };
}

/**
 * `CreateInstanceAppLayerTemplateProcessor` class is responsible for generating the application layer using
 * template approach for instance creation capability. This class provides specific logic for the generation of
 * template and dependencies needed for the application layer of the creation capability of the generated application.
 *
 * @template CreateInstanceCapabilityAppLayerTemplate - The type of the creation capability application layer template model.
 */
export class CreateInstanceAppLayerTemplateProcessor extends ApplicationLayerTemplateGenerator<CreateInstanceCapabilityAppLayerTemplate> {

    private static readonly _createAppLayerTemplatePath: string = "./create/application-layer/create-instance-app-logic";
    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: CreateInstanceAppLayerTemplateProcessor._createAppLayerTemplatePath
        })
    }

    /**
     * This method is responsible for the population of the application layer template for instance creation capability.
     * When all dependencies needed by template (@see {CreateInstanceCapabilityAppLayerTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting code.
     *
     * @param dependencies
     * @returns The promise which results to a `LayerArtifact` instance - the application layer code of the instance creation capability.
     */
    async processTemplate(dependencies: ApplicationLayerTemplateDependencyMap): Promise<LayerArtifact> {

        const generatedCapabilityInterface = await GeneratedCapabilityInterfaceGenerator.processTemplate();
        const creatorInterfaceArtifact = await InstanceCreatorInterfaceGenerator.processTemplate();
        const createAppLayerExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "CreateCapabilityLogic"
        });

        if (!creatorInterfaceArtifact || !creatorInterfaceArtifact.dependencies) {
            throw new Error("At least one interface dependency is expected");
        }

        let createReturnTypeArtifact = creatorInterfaceArtifact
            .dependencies
            .find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!createReturnTypeArtifact) {
            createReturnTypeArtifact = await InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const createInstanceAppLayerTemplate: CreateInstanceCapabilityAppLayerTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                exported_object_name: createAppLayerExportedName,
                instance_creator_type: dependencies.dataLayerLinkArtifact.exportedObjectName,
                instance_creator_type_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.dataLayerLinkArtifact.filePath
                },
                creator_interface_type: creatorInterfaceArtifact.exportedObjectName,
                creator_interface_type_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.pathResolver.getFullSavePath(creatorInterfaceArtifact.filePath,
                        creatorInterfaceArtifact.exportedObjectName
                    )
                },
                generated_capability_class: generatedCapabilityInterface.exportedObjectName,
                read_return_type: createReturnTypeArtifact.exportedObjectName,
                read_return_type_path: {
                    from: this._filePath,
                    to: createReturnTypeArtifact.filePath
                }
            }
        };

        const createInstanceAppLayerRender = this._templateRenderer.renderTemplate(createInstanceAppLayerTemplate);

        const createAppLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: createAppLayerExportedName,
            sourceText: createInstanceAppLayerRender,
            dependencies: [creatorInterfaceArtifact, createReturnTypeArtifact]
        }

        return createAppLayerArtifact;
    }
}