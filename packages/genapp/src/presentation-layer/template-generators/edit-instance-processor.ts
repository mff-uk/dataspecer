import { LayerArtifact } from "../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";
import { ApplicationGraphEdgeType } from "../../engine/graph";
import { AllowedTransition } from "../../engine/transitions/transitions-generator";
import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { AggregateMetadata } from "../../application-config";
import { ArtifactCache } from "../../utils/artifact-saver";

/**
 * Interface representing the template model for rendering the React component for edit instance capability.
 *
 * @interface EditInstanceReactComponentTemplate
 */
interface EditInstanceReactComponentTemplate extends TemplateModel {
    /** @inheritdoc */
    placeholders: {
        aggregate_name: string,
        page_title: string | null,
        exported_object_name: string,
        edit_capability_app_layer: string,
        edit_capability_app_layer_path: ImportRelativePath,
        edit_get_detail_app_layer: string,
        edit_get_detail_app_layer_path: ImportRelativePath,
        json_schema: string,
        navigation_hook: string,
        navigation_hook_path: ImportRelativePath,
        redirects: AllowedTransition[];
    };
}

/**
 * The `EditInstanceComponentTemplateProcessor` class is a generator responsible for generating
 * React component source code to enable edit instance capability for a given aggregate instance.
 * It extends the `PresentationLayerTemplateGenerator` template generator and makes use of `EditInstanceReactComponentTemplate`
 * for template population and rendering.
 *
 * @extends PresentationLayerTemplateGenerator<EditInstanceReactComponentTemplate>
 */
export class EditInstanceComponentTemplateProcessor extends PresentationLayerTemplateGenerator<EditInstanceReactComponentTemplate> {
    strategyIdentifier: string = "edit-react-component-generator";

    private static readonly _editComponentTemplatePath: string = "./edit/presentation-layer/edit-instance-component";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: EditInstanceComponentTemplateProcessor._editComponentTemplatePath
        })
    }

    /**
     * Retrieves the detail capability logic name and artifact path for a given aggregate.
     * @param aggregate - The aggregate metadata containing information about the aggregate.
     * @returns A tuple containing the detail capability logic exported name and its corresponding artifact path.
     * @throws Error if the detail capability logic artifact path is not found in the ArtifactCache.
     */
    private readInstanceDetail(aggregate: AggregateMetadata): [string, string] {
        const detailAppLayerExportedName: string = aggregate.getAggregateNamePascalCase({ suffix: "DetailCapabilityLogic" });

        const detailAppLayerArtifactPath = ArtifactCache.content[detailAppLayerExportedName];

        if (!detailAppLayerArtifactPath) {
            throw new Error();
        }

        return [detailAppLayerExportedName, detailAppLayerArtifactPath];
    }


    /**
     * This method is responsible for processing and rendering of the template to generate a React component source code
     * for editing an instance of the specified aggregate. This method prepares necessary placeholders to be populated and
     * applies template rendering. After rendering, the artifact which includes the component source code as well as other
     * metadata for the generated component is created.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A Promise which resolves to a LayerArtifact that contains generated React component for instance edit capability.
     */
    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const editExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            prefix: "Edit",
            suffix: "Instance"
        });

        const [getDetailName, getDetailPath] = this.readInstanceDetail(dependencies.aggregate);

        const dataSchemaInterface = this.restoreAggregateDataModelInterface(dependencies.aggregate);

        const redirectTransitions = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Redirection.toString()]!;

        const useNavigationHook = await UseNavigationHookGenerator.processTemplate();

        const editInstanceComponentTemplate: EditInstanceReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: dependencies.aggregate.getAggregateNamePascalCase(),
                page_title: this.getTemplatePageTitle(dependencies.detailNodeConfig.pageTitle),
                exported_object_name: editExportedName,
                edit_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                edit_capability_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                edit_get_detail_app_layer: getDetailName,
                edit_get_detail_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.pathResolver.getFullSavePath(
                        getDetailPath,
                        getDetailName
                    )
                },
                navigation_hook: useNavigationHook.exportedObjectName,
                navigation_hook_path: {
                    from: this._filePath,
                    to: useNavigationHook.filePath
                },
                redirects: redirectTransitions,
                json_schema: JSON.stringify(dataSchemaInterface, null, 2)
            }
        }

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(editInstanceComponentTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: editExportedName,
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.appLogicArtifact]
        }

        return presentationLayerArtifact;
    }
}