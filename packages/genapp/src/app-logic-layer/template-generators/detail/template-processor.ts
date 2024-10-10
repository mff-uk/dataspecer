import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateMetadata } from "../../../engine/templates/template-consumer";
import { DetailReaderInterfaceGenerator } from "../../../data-layer/template-generators/reader-interface-generator";
import { ApplicationLayerTemplateDependencyMap, ApplicationLayerTemplateGenerator } from "../template-app-layer-generator";
import { GeneratedCapabilityInterfaceGenerator, InstanceResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/templates/template-interfaces";

interface DetailCapabilityAppLayerTemplate extends TemplateDescription {
    placeholders: {
        detail_app_layer_exported_name: string,
        instance_reader_interface: string,
        generated_capability_class: string,
        read_return_type: string,
        read_return_type_path: ImportRelativePath,
        reader_implementation_path: ImportRelativePath,
        instance_reader_interface_path: ImportRelativePath,
    };
}

export class DetailAppLayerTemplateProcessor extends ApplicationLayerTemplateGenerator<DetailCapabilityAppLayerTemplate> {

    strategyIdentifier: string = "detail-app-template-generator";

    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    async processTemplate(dependencies: ApplicationLayerTemplateDependencyMap): Promise<LayerArtifact> {

        const detailAppLayerExportedName: string = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "DetailCapabilityLogic"
        });

        const instanceReaderInterfaceArtifact = await DetailReaderInterfaceGenerator.processTemplate();

        if (!instanceReaderInterfaceArtifact.dependencies || instanceReaderInterfaceArtifact.dependencies.length === 0) {
            throw new Error("Reader interface expects at least one dependency artifact - return type of the read function.");
        }

        let instanceReturnTypeArtifact = instanceReaderInterfaceArtifact.dependencies.find(artifact => artifact.exportedObjectName === "InstanceResult");

        if (!instanceReturnTypeArtifact) {
            instanceReturnTypeArtifact = await InstanceResultReturnInterfaceGenerator.processTemplate();
        }

        const generatedCapabilityInterface = await GeneratedCapabilityInterfaceGenerator.processTemplate();

        const detailAppLayerTemplate: DetailCapabilityAppLayerTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                detail_app_layer_exported_name: detailAppLayerExportedName,
                instance_reader_interface: instanceReaderInterfaceArtifact.exportedObjectName,
                read_return_type: instanceReturnTypeArtifact.exportedObjectName,
                generated_capability_class: generatedCapabilityInterface.exportedObjectName,
                instance_reader_interface_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.pathResolver.getFullSavePath(
                        instanceReaderInterfaceArtifact.filePath,
                        instanceReaderInterfaceArtifact.exportedObjectName
                    )
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