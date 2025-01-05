import { GeneratedCapabilityInterfaceGenerator, InstanceResultReturnInterfaceGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { DeleteInstanceMutatorInterfaceGenerator } from "../../data-layer/template-generators/reader-interface-generator";
import { LayerArtifact } from "../../engine/layer-artifact";
import { ApplicationLayerTemplateDependencyMap, ApplicationLayerTemplateGenerator } from "./template-app-layer-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";

/**
 * Interface which represents the template model for rendering the deletion capability template within the application layer.
 */
interface DeleteCapabilityAppLayerTemplate extends TemplateModel {
    /** @inheritdoc */
    placeholders: {
        exported_object_name: string;
        delete_mutator_instance: string;
        delete_mutator_instance_path: ImportRelativePath;
        delete_mutator_interface_type: string;
        delete_mutator_interface_type_path: ImportRelativePath;
        generated_capability_class: string;
        read_return_type: string;
        read_return_type_path: ImportRelativePath;
    };
}

/**
 * `DeleteAppLayerTemplateProcessor` class is responsible for generating the application layer using
 * template approach for deletion capability. This class provides specific logic for the generation of
 * template and dependencies needed for the application layer of the deletion capability of the generated application.
 *
 * @template DeleteCapabilityAppLayerTemplate - The type of the deletion capability application layer template model.
 */
export class DeleteAppLayerTemplateProcessor extends ApplicationLayerTemplateGenerator<DeleteCapabilityAppLayerTemplate> {

    private static readonly _deleteAppLayerTemplatePath: string = "./delete/application-layer/delete-instance-app-logic";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: DeleteAppLayerTemplateProcessor._deleteAppLayerTemplatePath
        })
    }

    /**
     * This method is responsible for the population of the application layer template for instance deletion capability.
     * When all dependencies needed by template (@see {DeleteCapabilityAppLayerTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting code.
     *
     * @param dependencies
     * @returns The promise which results to a `LayerArtifact` instance - the application layer code of the instance deletion capability.
     */
    async processTemplate(dependencies: ApplicationLayerTemplateDependencyMap): Promise<LayerArtifact> {

        const generatedCapabilityInterface = await GeneratedCapabilityInterfaceGenerator.processTemplate();
        const deleteMutatorInterfaceArtifact = await DeleteInstanceMutatorInterfaceGenerator.processTemplate();
        const deleteAppLayerExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "DeleteCapabilityLogic"
        });

        if (!deleteMutatorInterfaceArtifact || !deleteMutatorInterfaceArtifact.dependencies) {
            throw new Error("At least one interface dependency is expected");
        }

        let deleteReturnTypeArtifact = deleteMutatorInterfaceArtifact
            .dependencies
            .find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!deleteReturnTypeArtifact) {
            deleteReturnTypeArtifact = await InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const deleteInstanceAppLayerTemplate: DeleteCapabilityAppLayerTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                exported_object_name: deleteAppLayerExportedName,
                delete_mutator_instance: dependencies.dataLayerLinkArtifact.exportedObjectName,
                delete_mutator_instance_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.pathResolver.getFullSavePath(
                        dependencies.dataLayerLinkArtifact.filePath,
                        dependencies.dataLayerLinkArtifact.exportedObjectName
                    )
                },
                delete_mutator_interface_type: deleteMutatorInterfaceArtifact.exportedObjectName,
                delete_mutator_interface_type_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.pathResolver.getFullSavePath(
                        deleteMutatorInterfaceArtifact.filePath,
                        deleteMutatorInterfaceArtifact.exportedObjectName
                    )
                },
                generated_capability_class: generatedCapabilityInterface.exportedObjectName,
                read_return_type: deleteReturnTypeArtifact.exportedObjectName,
                read_return_type_path: {
                    from: this._filePath,
                    to: deleteReturnTypeArtifact.filePath
                }
            }
        }

        const deleteInstanceAppLayerRender = this._templateRenderer.renderTemplate(deleteInstanceAppLayerTemplate);

        const deleteInstanceLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: deleteAppLayerExportedName,
            sourceText: deleteInstanceAppLayerRender,
            dependencies: [deleteMutatorInterfaceArtifact, deleteReturnTypeArtifact]
        }

        return deleteInstanceLayerArtifact;
    }

}