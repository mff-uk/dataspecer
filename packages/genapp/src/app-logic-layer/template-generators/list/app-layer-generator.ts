import { LayerArtifact } from "../../../engine/layer-artifact";
import { StageGenerationContext } from "../../../engine/generator-stage-interface";
import { ListCapabilityTemplate } from "../../../template-interfaces/app/list-capability-template";
import { ReaderInterfaceGenerator } from "../../../data-layer/template-generators/reader-interface-generator";
import { ApplicationLayerGenerator } from "../../app-layer-strategy-interface";
import { CapabilityInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { TemplateConsumer, TemplateDependencyMap } from "../../../templates/template-consumer";

interface ListApplicationLayerTemplateDependencyMap extends TemplateDependencyMap {
    dataLayerLinkArtifact: LayerArtifact
}

export class ListAppLayerTemplateGenerator extends TemplateConsumer<ListCapabilityTemplate> implements ApplicationLayerGenerator {

    strategyIdentifier: string = "list-app-template-generator";

    constructor({ templatePath, filePath }: { templatePath: string, filePath: string }) {
        super(
            templatePath ?? "./list/application-layer/overview-app-logic",
            filePath ?? "./list-app-logic.ts"
        );
    }

    generateApplicationLayer(context: StageGenerationContext): Promise<LayerArtifact> {

        if (!context.previousResult) {
            throw new Error("'List capability' application layer depends on LayerArtifact from previous layer");
        }

        const listApplicationLayer = this.processTemplate({
            dataLayerLinkArtifact: context.previousResult
        });

        return Promise.resolve(listApplicationLayer);
    }

    processTemplate(dependencies: ListApplicationLayerTemplateDependencyMap): LayerArtifact {

        //const fullPath = this.artifactSaver ? this.artifactSaver.getFullSavePath(this._filePath) : this._filePath;

        const readerInterfaceArtifact = new ReaderInterfaceGenerator().processTemplate();
        const capabilityResultArtifact = new CapabilityInterfaceGenerator().processTemplate();

        const listApplicationTemplate: ListCapabilityTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                list_reader_interface: readerInterfaceArtifact.exportedObjectName,
                read_return_type: capabilityResultArtifact.exportedObjectName,
                read_return_type_path: {
                    from: this._filePath,
                    to: capabilityResultArtifact.filePath
                },
                generated_capability_class: "GeneratedCapability",
                reader_implementation_path: {
                    from: "", //fullPath,
                    to: dependencies.dataLayerLinkArtifact.filePath
                },
                list_reader_interface_path: {
                    from: "", //fullPath,
                    to: readerInterfaceArtifact.filePath
                }
            }
        }

        const listAppLogicRender = this._templateRenderer.renderTemplate(listApplicationTemplate);

        const listAppLogicLayerArtifact: LayerArtifact = {
            exportedObjectName: "ListCapabilityLogic",
            filePath: this._filePath,
            sourceText: listAppLogicRender,
            dependencies: [readerInterfaceArtifact, capabilityResultArtifact]
        }

        return listAppLogicLayerArtifact;
    }
}