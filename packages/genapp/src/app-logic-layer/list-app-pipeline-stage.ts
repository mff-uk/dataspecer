import { LayerArtifact } from "../engine/layer-artifact";
import { TemplateConsumer } from "../templates/template-consumer";
import { GeneratorStage, StageGenerationContext } from "../engine/generator-stage-interface";
import { ArtifactSaver } from "../utils/artifact-saver";
import { ImportRelativePath, TemplateDescription } from "./template-app-logic-generator";
import { ReaderInterfaceGenerator } from "../data-layer/reader-interface-generator";
import { CapabilityInterfaceGenerator } from "../capabilities/capability-interface-generator";

interface ListCapabilityTemplate extends TemplateDescription {
    templatePath: string,
    placeholders: {
        list_reader_interface: string,
        list_reader_interface_path: ImportRelativePath,
        reader_implementation_path: ImportRelativePath,
        generated_capability_class: string,
        read_return_type: string,
        read_return_type_path: ImportRelativePath
    }
}

export class ListCapabilityApplicationLayerStage extends TemplateConsumer implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private _dataLayerLinkArtifact!: LayerArtifact;

    constructor(templatePath?: string, filePath?: string) {
        super(
            templatePath ?? "./overview/overview-app-logic",
            filePath ?? "./overview-app-logic.ts"
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

        // TODO: for the 2 lines below: the artifacts have already been generated within another layer,
        // Handle filepath calculation, so that the target filepath corresponds to the actual saved filepath
        const readerInterfaceArtifact = new ReaderInterfaceGenerator().consumeTemplate(); //this.getReaderWithUpdatedFilepath();
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

    // private getReaderWithUpdatedFilepath(): LayerArtifact {
    //     const initReaderInterface = new ReaderInterfaceGenerator().consumeTemplate();

    //     if (!this._dataLayerLinkArtifact.dependencies) {
    //         throw new Error("Missing Data layer link");
    //     }

    //     const matchingReaderInterfaces = this._dataLayerLinkArtifact
    //         .dependencies
    //         .filter(dalArtifact => dalArtifact.exportedObjectName === initReaderInterface.exportedObjectName);

    //     if (matchingReaderInterfaces.length !== 1) {
    //         return initReaderInterface;
    //     }

    //     const validMatchingReaderInterface = matchingReaderInterfaces.at(0);

    //     if (!validMatchingReaderInterface) {
    //         return initReaderInterface;
    //     }

    //     return validMatchingReaderInterface;
    // }
}