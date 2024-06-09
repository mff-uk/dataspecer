import { GeneratorStage, StageGenerationContext } from "../engine/generator-stage-interface";
import { ArtifactSaver } from "../utils/artifact-saver";
import { LayerArtifact } from "../engine/layer-artifact";
import { TemplateConsumer } from "../templates/template-consumer";
import { ListTableTemplate } from "../template-interfaces/presentation/list-table-template";

export class PresentationLayerStage extends TemplateConsumer implements GeneratorStage {

    private _listAppLogicArtifact!: LayerArtifact;
    artifactSaver: ArtifactSaver;

    constructor(templatePath?: string, filepath?: string) {
        super(
            templatePath ?? "./list/presentation-layer/table-component",
            filepath ?? "ListTable.tsx"
        );
        this.artifactSaver = new ArtifactSaver("/components/list");
    }

    generateStage(context: StageGenerationContext): Promise<LayerArtifact> {
        
        if (!context.previousResult) {
            const errorArtifact: LayerArtifact = {
                filePath: "",
                exportedObjectName: "ErrorPage",
                sourceText: ""
            }

            return Promise.resolve(errorArtifact);
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
                list_capability_app_layer: this._listAppLogicArtifact.exportedObjectName,
                list_app_layer_path: {
                    from: fullPath,
                    to: this._listAppLogicArtifact.filePath
                }
            }
        };

        const presentationLayerRender = this._templateRenderer.renderTemplate(tableTemplate);

        return {
            exportedObjectName: "ListTable",
            filePath: this._filePath,
            sourceText: presentationLayerRender
        };
    }
}