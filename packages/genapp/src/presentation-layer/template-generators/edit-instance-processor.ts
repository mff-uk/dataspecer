import { LayerArtifact } from "../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator";
import { ImportRelativePath, TemplateDescription } from "../../engine/templates/template-interfaces";
import { JsonSchemaProvider } from "../../data-layer/schema-providers/json-schema-provider";
import { ApplicationGraphEdgeType } from "../../engine/graph";
import { AllowedTransition } from "../../engine/transitions/transitions-generator";
import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator";

interface EditInstanceReactComponentTemplate extends TemplateDescription {
    placeholders: {
        exported_object_name: string;
        edit_capability_app_layer: string,
        edit_capability_app_layer_path: ImportRelativePath,
        json_schema: string,
        json_schema_path: ImportRelativePath,
        navigation_hook: string,
        navigation_hook_path: ImportRelativePath,
        redirects: AllowedTransition[];
    };
}

export class EditInstanceComponentTemplateProcessor extends PresentationLayerTemplateGenerator<EditInstanceReactComponentTemplate> {
    strategyIdentifier: string = "edit-react-component-generator";

    private static readonly _editComponentTemplatePath: string = "./edit/presentation-layer/edit-instance-component";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: EditInstanceComponentTemplateProcessor._editComponentTemplatePath
        })
    }

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const editExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            prefix: "Edit",
            suffix: "Instance"
        });

        const jsonSchemaArtifact = await new JsonSchemaProvider(dependencies.aggregate.specificationIri)
            .getSchemaArtifact(dependencies.aggregate);

        const redirectTransitions = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Redirection.toString()]!;

        const useNavigationHook = await UseNavigationHookGenerator.processTemplate();

        const editInstanceComponentTemplate: EditInstanceReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                exported_object_name: editExportedName,
                edit_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                edit_capability_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                navigation_hook: useNavigationHook.exportedObjectName,
                navigation_hook_path: {
                    from: this._filePath,
                    to: useNavigationHook.filePath
                },
                redirects: redirectTransitions,
                json_schema: jsonSchemaArtifact.exportedObjectName,
                json_schema_path: {
                    from: this._filePath,
                    to: jsonSchemaArtifact.filePath
                }
            }
        }

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(editInstanceComponentTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: editExportedName,
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.appLogicArtifact, jsonSchemaArtifact]
        }

        return presentationLayerArtifact;
    }
}