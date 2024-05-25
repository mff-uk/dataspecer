import { ImportRelativePath, TemplateDescription } from "../app-logic-layer/template-app-logic-generator";
import { ArtifactSaver, GeneratorStage, StageGenerationContext } from "../engine/generator-stage-interface";
import { LayerArtifact } from "../engine/layer-artifact";
import { TemplateConsumer } from "../templates/template-consumer";

export interface ListTableTemplate extends TemplateDescription {
    templatePath: string,
    placeholders: {
        app_logic_delegate: string,
        delegate_path: ImportRelativePath
    }
}

export class PresentationLayerStage extends TemplateConsumer implements GeneratorStage {

    private _listAppLogicArtifact!: LayerArtifact;
    artifactSaver: ArtifactSaver;

    constructor(templatePath?: string, filepath?: string) {
        super(
            templatePath ?? "./overview/overview-table",
            filepath ?? "OverviewTable.tsx"
        );
        this.artifactSaver = new ArtifactSaver("/components/overview");
    }

    generateStage(context: StageGenerationContext): Promise<LayerArtifact> {
        
        if (!context.previousResult) {
            throw new Error("'List capability' application layer depends on LayerArtifact from previous layer");
        }

        this._listAppLogicArtifact = context.previousResult;

        const presentationLayerArtifact = this.consumeTemplate();

        return Promise.resolve(presentationLayerArtifact);
    }
    
    consumeTemplate(): LayerArtifact {

        const fullPath = this.artifactSaver ? this.artifactSaver.getFullSavePath(this._filePath) : this._filePath;
        const tableTemplate: ListTableTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                app_logic_delegate: this._listAppLogicArtifact.exportedObjectName,
                delegate_path: {
                    from: fullPath,
                    to: this._listAppLogicArtifact.fileName
                }
            }
        };

        const presentationLayerRender = this._templateRenderer.renderTemplate(tableTemplate);

        return {
            exportedObjectName: "OverviewTable",
            fileName: this._filePath,
            sourceText: presentationLayerRender
        };
    }
}