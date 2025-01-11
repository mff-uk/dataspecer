import { LayerArtifact } from "../../engine/layer-artifact";
import { DetailReaderInterfaceGenerator } from "../../data-layer/template-generators/reader-interface-generator";
import { ApplicationLayerTemplateDependencyMap, ApplicationLayerTemplateGenerator } from "./template-app-layer-generator";
import { GeneratedCapabilityInterfaceGenerator, InstanceResultReturnInterfaceGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";

/**
 * Interface which represents the template model for rendering the detail capability template within the application layer.
 */
interface DetailCapabilityAppLayerTemplate extends TemplateModel {
    /** @inheritdoc */
    placeholders: {
        detail_app_layer_exported_name: string;
        instance_reader_interface: string;
        generated_capability_class: string;
        return_type: string;
        return_type_path: ImportRelativePath;
        reader_implementation_path: ImportRelativePath;
        instance_reader_interface_path: ImportRelativePath;
    };
}

/**
 * `DetailAppLayerTemplateProcessor` class is responsible for generating the application layer using
 * template approach for detail capability. This class provides specific logic for the generation of
 * template and dependencies needed for the application layer of the detail capability of the generated application.
 *
 * @template DetailCapabilityAppLayerTemplate - The type of the detail capability application layer template model.
 */
export class DetailAppLayerTemplateProcessor extends ApplicationLayerTemplateGenerator<DetailCapabilityAppLayerTemplate> {

    strategyIdentifier: string = "detail-app-template-generator";

    private static readonly _detailAppLayerTemplatePath: string = "./detail/application-layer/detail-app-logic";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: DetailAppLayerTemplateProcessor._detailAppLayerTemplatePath
        });
    }

    /**
     * This method is responsible for the population of the application layer template for detail capability.
     * When all dependencies needed by template (@see {DetailCapabilityAppLayerTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting code.
     *
     * @param dependencies
     * @returns The promise which results to a `LayerArtifact` instance - the application layer code of the detail capability.
     */
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
                return_type: instanceReturnTypeArtifact.exportedObjectName,
                generated_capability_class: generatedCapabilityInterface.exportedObjectName,
                instance_reader_interface_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.pathResolver.getFullSavePath(
                        instanceReaderInterfaceArtifact.filePath,
                        instanceReaderInterfaceArtifact.exportedObjectName
                    )
                },
                return_type_path: {
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