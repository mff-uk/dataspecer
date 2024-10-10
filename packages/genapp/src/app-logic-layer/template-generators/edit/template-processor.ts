import { GeneratedCapabilityInterfaceGenerator, InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { InstanceCreatorInterfaceGenerator } from "../../../data-layer/template-generators/reader-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { ApplicationLayerTemplateDependencyMap, ApplicationLayerTemplateGenerator } from "../template-app-layer-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer"

interface EditInstanceCapabilityAppLayerTemplate extends TemplateDescription {
    placeholders: {
        exported_object_name: string,
        instance_creator_type: string,
        instance_creator_type_path: ImportRelativePath,
        editor_interface_type: string,
        editor_interface_type_path: ImportRelativePath,
        generated_capability_class: string,
        read_return_type: string,
        read_return_type_path: ImportRelativePath,
    };
}

export class EditInstanceAppLayerTemplateProcessor extends ApplicationLayerTemplateGenerator<EditInstanceCapabilityAppLayerTemplate> {

    async processTemplate(dependencies: ApplicationLayerTemplateDependencyMap): Promise<LayerArtifact> {

        const generatedCapabilityInterface = await GeneratedCapabilityInterfaceGenerator.processTemplate();
        const editorInterfaceArtifact = await InstanceCreatorInterfaceGenerator.processTemplate();
        const editAppLayerExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "EditCapabilityLogic"
        });

        if (!editorInterfaceArtifact || !editorInterfaceArtifact.dependencies) {
            throw new Error("At least one interface dependency is expected");
        }

        let editReturnTypeArtifact = editorInterfaceArtifact
            .dependencies
            .find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!editReturnTypeArtifact) {
            editReturnTypeArtifact = await InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const editInstanceAppLayerTemplate: EditInstanceCapabilityAppLayerTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                exported_object_name: editAppLayerExportedName,
                instance_creator_type: dependencies.dataLayerLinkArtifact.exportedObjectName,
                instance_creator_type_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.dataLayerLinkArtifact.filePath
                },
                editor_interface_type: editorInterfaceArtifact.exportedObjectName,
                editor_interface_type_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.pathResolver.getFullSavePath(editorInterfaceArtifact.filePath,
                        editorInterfaceArtifact.exportedObjectName
                    )
                },
                generated_capability_class: generatedCapabilityInterface.exportedObjectName,
                read_return_type: editReturnTypeArtifact.exportedObjectName,
                read_return_type_path: {
                    from: this._filePath,
                    to: editReturnTypeArtifact.filePath
                }
            }
        };

        const editInstanceAppLayerRender = this._templateRenderer.renderTemplate(editInstanceAppLayerTemplate);

        const editAppLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: editAppLayerExportedName,
            sourceText: editInstanceAppLayerRender,
            dependencies: [editorInterfaceArtifact, editReturnTypeArtifact]
        }

        return editAppLayerArtifact;
    }
}