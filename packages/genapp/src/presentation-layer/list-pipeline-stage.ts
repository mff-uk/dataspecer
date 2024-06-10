import { GeneratorStage, StageGenerationContext } from "../engine/generator-stage-interface";
import { ArtifactSaver } from "../utils/artifact-saver";
import { LayerArtifact } from "../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../templates/template-consumer";
import { ListTableTemplate } from "../template-interfaces/presentation/list-table-template";

interface ListPresentationDependencyMap extends TemplateDependencyMap {
    listAppLogicArtifact: LayerArtifact;
}

function isListPresentationDependencyMap(obj: TemplateDependencyMap): obj is ListPresentationDependencyMap {
    return (obj as ListPresentationDependencyMap) !== undefined;
}

export class PresentationLayerStage extends TemplateConsumer<ListTableTemplate> implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    constructor(templatePath?: string, filepath?: string) {
        super(
            templatePath ?? "./list/presentation-layer/table-component",
            filepath ?? "ListTable.tsx"
        );
        this.artifactSaver = new ArtifactSaver("/presentation-layer/list");
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

        const presentationLayerArtifact = this.processTemplate({
            listAppLogicArtifact: context.previousResult
        });

        return Promise.resolve(presentationLayerArtifact);
    }
    
    processTemplate(dependencies: ListPresentationDependencyMap): LayerArtifact {

        if (!dependencies || !isListPresentationDependencyMap(dependencies)) {
            throw new Error();
        }

        const tableTemplate: ListTableTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                list_capability_app_layer: dependencies.listAppLogicArtifact.exportedObjectName,
                list_app_layer_path: {
                    from: this._filePath,
                    to: dependencies.listAppLogicArtifact.filePath
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