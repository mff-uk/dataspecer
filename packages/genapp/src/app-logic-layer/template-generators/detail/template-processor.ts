import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateMetadata } from "../../../templates/template-consumer";
import { DetailCapabilityAppLayerTemplate } from "./detail-app-layer-template";
import { DetailReaderInterfaceGenerator } from "../../../data-layer/template-generators/reader-interface-generator";
import { ApplicationLayerTemplateDependencyMap, ApplicationLayerTemplateGenerator } from "../template-app-layer-generator";
import { GeneratedCapabilityInterfaceGenerator, InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";

export class DetailAppLayerTemplateProcessor extends ApplicationLayerTemplateGenerator<DetailCapabilityAppLayerTemplate> {
    
    strategyIdentifier: string = "detail-app-template-generator";

    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    processTemplate(dependencies: ApplicationLayerTemplateDependencyMap): LayerArtifact {
        
        const detailAppLayerExportedName: string = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "DetailCapabilityLogic"
        });
        
        const instanceReaderInterfaceArtifact = DetailReaderInterfaceGenerator.processTemplate();

        if (!instanceReaderInterfaceArtifact.dependencies || instanceReaderInterfaceArtifact.dependencies.length === 0) {
            throw new Error("Reader interface expects at least one dependency artifact - return type of the read function.");
        }

        let instanceReturnTypeArtifact = instanceReaderInterfaceArtifact.dependencies.find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!instanceReturnTypeArtifact) {
            instanceReturnTypeArtifact = InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const generatedCapabilityInterface = GeneratedCapabilityInterfaceGenerator.processTemplate();
        
        const detailAppLayerTemplate: DetailCapabilityAppLayerTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                detail_app_layer_exported_name: detailAppLayerExportedName,
                instance_reader_interface: instanceReaderInterfaceArtifact.exportedObjectName,
                read_return_type: instanceReturnTypeArtifact.exportedObjectName,
                generated_capability_class: generatedCapabilityInterface.exportedObjectName,
                instance_reader_interface_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: instanceReaderInterfaceArtifact.filePath
                },
                read_return_type_path: {
                    from: this._filePath,
                    to: instanceReturnTypeArtifact.filePath
                },
                reader_implementation_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.dataLayerLinkArtifact.filePath
                }
            }
        }

        const detailAppLogicRender = this._templateRenderer.renderTemplate(detailAppLayerTemplate);

        const detailAppLayerLogicArtifact: LayerArtifact = {
            exportedObjectName: detailAppLayerExportedName,
            filePath: this._filePath,
            sourceText: detailAppLogicRender,
            dependencies: [instanceReaderInterfaceArtifact, instanceReturnTypeArtifact]
        }

        return detailAppLayerLogicArtifact;
    }
}