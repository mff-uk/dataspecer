import { LayerArtifact } from "../engine/layer-artifact";
import { TemplateConsumer } from "../templates/template-consumer";
import { GeneratorStage, StageGenerationContext } from "../engine/generator-stage-interface";
import { ArtifactSaver } from "../utils/artifact-saver";
import { ReaderInterfaceGenerator } from "../data-layer/reader-interface-generator";
import { CapabilityInterfaceGenerator } from "../capabilities/capability-interface-generator";
import { ListCapabilityTemplate } from "../template-interfaces/app/list-capability-template";

export class ListCapabilityApplicationLayerStage extends TemplateConsumer implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private _dataLayerLinkArtifact!: LayerArtifact;

    constructor(templatePath?: string, filePath?: string) {
        super(
            templatePath ?? "./list/application-layer/overview-app-logic",
            filePath ?? "./list-app-logic.ts"
        );
        this.artifactSaver = new ArtifactSaver("/app-logic");
    }

    generateStage(context: StageGenerationContext): Promise<LayerArtifact> {

        if (!context.previousResult) {
            throw new Error("'List capability' application layer depends on LayerArtifact from previous layer");
        }

        this._dataLayerLinkArtifact = context.previousResult;

        const listApplicationLayer = this.consumeTemplate();
    
        return Promise.resolve(listApplicationLayer);
    }

    consumeTemplate(): LayerArtifact {

        if (!this._dataLayerLinkArtifact) {
            throw new Error("Cannot determine the link to data layer");
        }

        const fullPath = this.artifactSaver ? this.artifactSaver.getFullSavePath(this._filePath) : this._filePath;

        const readerInterfaceArtifact = new ReaderInterfaceGenerator().consumeTemplate();
        const capabilityResultArtifact = new CapabilityInterfaceGenerator().consumeTemplate();

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
                    from: fullPath,
                    to: this._dataLayerLinkArtifact.filePath
                },
                list_reader_interface_path: {
                    from: fullPath,
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