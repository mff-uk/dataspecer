import { LayerArtifact } from "../../../engine/layer-artifact";
import { ListCapabilityAppLayerTemplate } from "./list-app-layer-template";
import { ListReaderInterfaceGenerator } from "../../../data-layer/template-generators/reader-interface-generator";
import { GeneratedCapabilityInterfaceGenerator, ListResultReturnInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { TemplateMetadata } from "../../../templates/template-consumer";
import { ApplicationLayerTemplateDependencyMap } from "../app-layer-dependency-map";
import { ApplicationLayerTemplateGenerator } from "../template-app-layer-generator";

export class ListAppLayerTemplateProcessor extends ApplicationLayerTemplateGenerator<ListCapabilityAppLayerTemplate> {

    strategyIdentifier: string = "list-app-template-generator";

    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
        
    }

    processTemplate(dependencies: ApplicationLayerTemplateDependencyMap): LayerArtifact {

        const listAppLayerExportName = `${dependencies.aggregateHumanLabel}ListCapabilityLogic`
        const readerInterfaceArtifact = ListReaderInterfaceGenerator.processTemplate();
        
        if (!readerInterfaceArtifact.dependencies || readerInterfaceArtifact.dependencies.length === 0) {
            throw new Error("Reader interface expects at least one dependency artifact - return type of the read function.");
        }

        let listReturnTypeArtifact = readerInterfaceArtifact.dependencies.find(artifact => artifact.exportedObjectName === "ListResult");

        if (!listReturnTypeArtifact) {
            listReturnTypeArtifact = ListResultReturnInterfaceGenerator.processTemplate();
        }

        const generatedCapabilityInterface = GeneratedCapabilityInterfaceGenerator.processTemplate();
        
        const listApplicationTemplate: ListCapabilityAppLayerTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                list_app_layer_export_name: listAppLayerExportName,
                list_reader_interface: readerInterfaceArtifact.exportedObjectName,
                read_return_type: listReturnTypeArtifact.exportedObjectName,
                read_return_type_path: {
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
                    to: readerInterfaceArtifact.filePath
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