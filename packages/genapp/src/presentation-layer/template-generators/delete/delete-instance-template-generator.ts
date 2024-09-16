import { LayerArtifact } from "../../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";
import { AllowedTransition } from "../../../engine/transitions/transitions-generator";
import { UseNavigationHookGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { ApplicationGraphEdgeType } from "../../../engine/graph";

interface DeleteInstanceReactComponentTemplate extends TemplateDescription {
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
                    from: this._filePath,
                    to: dependencies.appLogicArtifact.filePath
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