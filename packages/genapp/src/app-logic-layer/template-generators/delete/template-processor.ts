import { GeneratedCapabilityInterfaceGenerator, InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { DeleteInstanceMutatorInterfaceGenerator } from "../../../data-layer/template-generators/reader-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { ApplicationLayerTemplateDependencyMap, ApplicationLayerTemplateGenerator } from "../template-app-layer-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer"

interface DeleteCapabilityAppLayerTemplate extends TemplateDescription {
    placeholders: {
        exported_object_name: string;
        delete_mutator_instance: string,
        delete_mutator_instance_path: ImportRelativePath,
        delete_mutator_interface_type: string,
        delete_mutator_interface_type_path: ImportRelativePath,
        generated_capability_class: string,
        read_return_type: string,
        read_return_type_path: ImportRelativePath,

    };
}

export class DeleteAppLayerTemplateProcessor extends ApplicationLayerTemplateGenerator<DeleteCapabilityAppLayerTemplate> {

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
                    to: dependencies.dataLayerLinkArtifact.filePath
                },
                delete_mutator_interface_type: deleteMutatorInterfaceArtifact.exportedObjectName,
                delete_mutator_interface_type_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: deleteMutatorInterfaceArtifact.filePath
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