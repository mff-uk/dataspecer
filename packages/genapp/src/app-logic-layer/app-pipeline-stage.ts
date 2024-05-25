import { LayerArtifact } from "../engine/layer-artifact";
import { TemplateConsumer } from "../templates/template-consumer";
import { ArtifactSaver, GeneratorStage, StageGenerationContext } from "../engine/generator-stage-interface";
import { ImportRelativePath, TemplateDescription } from "./template-app-logic-generator";
import { ReaderInterfaceGenerator } from "../data-layer/reader-interface-generator";

interface ListCapabilityTemplate extends TemplateDescription {
    templatePath: string,
    placeholders: {
        reader: string,
        reader_implementation: string,
        reader_interface_path: ImportRelativePath,
        reader_implementation_path: ImportRelativePath
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
        const readerInterfaceArtifact = this.getReaderWithUpdatedFilepath();

        const listApplicationTemplate: ListCapabilityTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                reader: readerInterfaceArtifact.exportedObjectName,
                reader_implementation: this._dataLayerLinkArtifact.exportedObjectName,
                reader_implementation_path: {
                    from: fullPath,
                    to: this._dataLayerLinkArtifact.fileName
                },
                reader_interface_path: {
                    from: fullPath,
                    to: readerInterfaceArtifact.fileName
                }
            }
        }

        const listAppLogicRender = this._templateRenderer.renderTemplate(listApplicationTemplate);

        const listAppLogicLayerArtifact: LayerArtifact = {
            exportedObjectName: "fetchObjects",
            fileName: this._filePath,
            sourceText: listAppLogicRender
        }

        return listAppLogicLayerArtifact;
    }

    private getReaderWithUpdatedFilepath(): LayerArtifact {
        const initReaderInterface = new ReaderInterfaceGenerator().consumeTemplate();

        if (!this._dataLayerLinkArtifact.dependencies) {
            throw new Error("Missing Data layer link");
        }

        const matchingReaderInterfaces = this._dataLayerLinkArtifact
            .dependencies
            .filter(dalArtifact => dalArtifact.exportedObjectName === initReaderInterface.exportedObjectName);

        if (matchingReaderInterfaces.length !== 1) {
            return initReaderInterface;
        }

        const validMatchingReaderInterface = matchingReaderInterfaces.at(0);

        if (!validMatchingReaderInterface) {
            return initReaderInterface;
        }

        return validMatchingReaderInterface;
    }
}