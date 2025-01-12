import { LayerArtifact } from "../../engine/layer-artifact";
import { ListReaderInterfaceGenerator } from "../../data-layer/template-generators/reader-interface-generator";
import { GeneratedCapabilityInterfaceGenerator, ListResultReturnInterfaceGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { ApplicationLayerTemplateDependencyMap, ApplicationLayerTemplateGenerator } from "./template-app-layer-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";

/**
 * Interface which represents the template model for rendering the list capability template within the application layer.
 */
interface ListCapabilityAppLayerTemplate extends TemplateModel {
    /**
     * @inheritdoc
     */
    placeholders: {
        list_reader_interface: string;
        list_reader_interface_path: ImportRelativePath;
        reader_implementation_path: ImportRelativePath;
        generated_capability_class: string;
        return_type: string;
        list_app_layer_export_name: string;
        return_type_path: ImportRelativePath;
    };
}

/**
 * `ListAppLayerTemplateProcessor` class is responsible for generating the application layer using
 * template population approach for list capability. This class provides specific logic for the population of
 * template and dependencies needed for the application layer of the list capability of the generated application.
 *
 * @template ListCapabilityAppLayerTemplate - The type of the list capability application layer template model.
 */
export class ListAppLayerTemplateProcessor extends ApplicationLayerTemplateGenerator<ListCapabilityAppLayerTemplate> {

    strategyIdentifier: string = "list-app-template-generator";

    private static readonly _listAppLayerTemplatePath: string = "./list/application-layer/list-app-logic";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: ListAppLayerTemplateProcessor._listAppLayerTemplatePath
        });

    }

    /**
     * This method is responsible for the population of the application layer template for list capability.
     * When all dependencies needed by template (@see {ListCapabilityAppLayerTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting code.
     *
     * @param dependencies
     * @returns The promise which results to a `LayerArtifact` instance - the application layer code of the list capability.
     */
    async processTemplate(dependencies: ApplicationLayerTemplateDependencyMap): Promise<LayerArtifact> {

        const readerInterfaceArtifact = await ListReaderInterfaceGenerator.processTemplate();
        const listAppLayerExportName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "ListCapabilityLogic"
        });

        if (!readerInterfaceArtifact.dependencies || readerInterfaceArtifact.dependencies.length === 0) {
            throw new Error("Reader interface expects at least one dependency artifact - return type of the read function.");
        }

        let listReturnTypeArtifact = readerInterfaceArtifact.dependencies.find(artifact => artifact.exportedObjectName === "ListResult");

        if (!listReturnTypeArtifact) {
            listReturnTypeArtifact = await ListResultReturnInterfaceGenerator.processTemplate();
        }

        const generatedCapabilityInterface = await GeneratedCapabilityInterfaceGenerator.processTemplate();

        const listApplicationTemplate: ListCapabilityAppLayerTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                list_app_layer_export_name: listAppLayerExportName,
                list_reader_interface: readerInterfaceArtifact.exportedObjectName,
                return_type: listReturnTypeArtifact.exportedObjectName,
                return_type_path: {
                    from: this._filePath,
                    to: listReturnTypeArtifact.filePath
                },
                generated_capability_class: generatedCapabilityInterface.exportedObjectName,
                reader_implementation_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.dataLayerLinkArtifact.filePath
                },
                list_reader_interface_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.pathResolver.getFullSavePath(
                        readerInterfaceArtifact.filePath,
                        readerInterfaceArtifact.exportedObjectName
                    )
                }
            }
        }

        const listAppLogicRender = this._templateRenderer.renderTemplate(listApplicationTemplate);

        const listAppLogicLayerArtifact: LayerArtifact = {
            exportedObjectName: listAppLayerExportName,
            filePath: this._filePath,
            sourceText: listAppLogicRender,
            dependencies: [readerInterfaceArtifact, listReturnTypeArtifact]
        }

        return listAppLogicLayerArtifact;
    }
}