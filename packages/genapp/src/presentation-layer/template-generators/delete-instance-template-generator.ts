import { LayerArtifact } from "../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";
import { AllowedTransition } from "../../engine/transitions/transitions-generator";
import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { ApplicationGraphEdgeType } from "../../engine/graph";

/**
 * Interface representing the template model for rendering the delete instance capability React Component.
 *
 * @extends TemplateModel
 */
interface DeleteInstanceReactComponentTemplate extends TemplateModel {
    /** @inheritdoc */
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

/**
 * The `DeleteInstanceComponentTemplateProcessor` class is responsible for generating the React component from a template
 * and thus generating the presentation layer code for instance deletion capability.
 * It extends the `PresentationLayerTemplateGenerator` class and makes use of `DeleteInstanceReactComponentTemplate`
 * for template population and rendering.
 *
 * @extends PresentationLayerTemplateGenerator<DeleteInstanceReactComponentTemplate>
 */
export class DeleteInstanceComponentTemplateProcessor extends PresentationLayerTemplateGenerator<DeleteInstanceReactComponentTemplate> {

    private static readonly  _detailComponentTemplatePath: string = "./delete/presentation-layer/delete-instance-confirmation-modal";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: DeleteInstanceComponentTemplateProcessor._detailComponentTemplatePath
        })
    }

    /**
     * This method is responsible for the population and rendering of the React component template for the deletion implementation.
     * After all dependencies needed by template (@see {DeleteInstanceReactComponentTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting React component.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A promise that resolves to the artifact which contains generated React component for instance deletion capability.
     */
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