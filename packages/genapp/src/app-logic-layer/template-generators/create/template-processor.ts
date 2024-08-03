import { GeneratedCapabilityInterfaceGenerator, InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { InstanceCreatorInterfaceGenerator } from "../../../data-layer/template-generators/reader-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { ApplicationLayerTemplateDependencyMap } from "../app-layer-dependency-map";
import { ApplicationLayerTemplateGenerator } from "../template-app-layer-generator";
import { CreateInstanceCapabilityAppLayerTemplate } from "./create-app-layer-template";

export class CreateInstanceAppLayerTemplateProcessor extends ApplicationLayerTemplateGenerator<CreateInstanceCapabilityAppLayerTemplate> {

    processTemplate(dependencies: ApplicationLayerTemplateDependencyMap): LayerArtifact {

        const generatedCapabilityInterface = GeneratedCapabilityInterfaceGenerator.processTemplate();
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

        const createInstanceAppLayerTemplate: CreateInstanceCapabilityAppLayerTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregateName,
                instance_creator_type: dependencies.dataLayerLinkArtifact.exportedObjectName,
                instance_creator_type_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.dataLayerLinkArtifact.filePath
                },
                creator_interface_type: creatorInterfaceArtifact.exportedObjectName,
                creator_interface_type_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: creatorInterfaceArtifact.filePath
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
            exportedObjectName: `${dependencies.aggregateName}CreateCapabilityLogic`,
            sourceText: createInstanceAppLayerRender,
            dependencies: [creatorInterfaceArtifact, createReturnTypeArtifact]
        }

        return createAppLayerArtifact;
    }
}