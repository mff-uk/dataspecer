import { LayerArtifact } from "../../engine/layer-artifact.ts";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator.ts";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces.ts";
import { AllowedTransition } from "../../engine/transitions/transitions-generator.ts";
import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator.ts";
import { ApplicationGraphEdgeType } from "../../engine/graph/index.ts";

interface DeleteInstanceReactComponentTemplate extends TemplateModel {
    placeholders: {
        aggregate_name: string;
        exported_name_object: string;
        aggregate_display_name: string;
        delete_app_layer: string;
        delete_app_layer_path: ImportRelativePath;
        navigation_hook: string;
        navigation_hook_path: ImportRelativePath;
        redirect_capability: AllowedTransition | null;
    };
}

export class DeleteInstanceComponentTemplateProcessor extends PresentationLayerTemplateGenerator<DeleteInstanceReactComponentTemplate> {

    private static readonly  _detailComponentTemplatePath: string = "./delete/presentation-layer/delete-instance-confirmation-modal";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: DeleteInstanceComponentTemplateProcessor._detailComponentTemplatePath
        })
    }

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const exportName = dependencies.aggregate.getAggregateNamePascalCase({
            prefix: "Delete",
            suffix: "Instance"
        });

        const useNavigationHook = await UseNavigationHookGenerator.processTemplate();
        const redirectEdge = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Redirection.toString()]!;

        const deleteInstanceTemplate: DeleteInstanceReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregate.technicalLabel,
                aggregate_display_name: dependencies.aggregate.getAggregateNamePascalCase(),
                exported_name_object: exportName,
                redirect_capability: redirectEdge.at(0) ?? null,
                navigation_hook: useNavigationHook.exportedObjectName,
                navigation_hook_path: {
                    from: this._filePath,
                    to: useNavigationHook.filePath
                },
                delete_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                delete_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.pathResolver.getFullSavePath(
                        dependencies.appLogicArtifact.filePath,
                        dependencies.appLogicArtifact.exportedObjectName
                    )
                },
            }
        }

        const deleteDialogComponentRender = this._templateRenderer.renderTemplate(deleteInstanceTemplate);

        const deleteInstanceArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: exportName,
            sourceText: deleteDialogComponentRender,
            dependencies: [useNavigationHook]
        }

        return deleteInstanceArtifact;
    }
}