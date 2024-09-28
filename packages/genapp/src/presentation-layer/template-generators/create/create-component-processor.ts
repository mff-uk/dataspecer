import { LayerArtifact } from "../../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";
import { JsonSchemaProvider } from "../../../data-layer/schema-providers/json-schema-provider";
import { ApplicationGraphEdgeType } from "../../../engine/graph";
import { AllowedTransition } from "../../../engine/transitions/transitions-generator";
import { UseNavigationHookGenerator } from "../../../capabilities/template-generators/capability-interface-generator";

interface CreateInstanceReactComponentTemplate extends TemplateDescription {
    placeholders: {
        exported_object_name: string;
        create_capability_app_layer: string,
        create_capability_app_layer_path: ImportRelativePath,
        json_schema: string,
        json_schema_path: ImportRelativePath,
        navigation_hook: string,
        navigation_hook_path: ImportRelativePath,
        redirects: AllowedTransition[];
    };
}

export class CreateInstanceComponentTemplateProcessor extends PresentationLayerTemplateGenerator<CreateInstanceReactComponentTemplate> {
    strategyIdentifier: string = "create-react-component-generator";

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const createExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            prefix: "Create",
            suffix: "Instance"
        });

        const jsonSchemaArtifact = await new JsonSchemaProvider(dependencies.aggregate.specificationIri)
            .getSchemaArtifact(dependencies.aggregate);

        const redirectTransitions = dependencies.transitions.groupByTransitionType()[ApplicationGraphEdgeType.Redirection.toString()]!;

        const useNavigationHook = await UseNavigationHookGenerator.processTemplate();

        const createInstanceComponentTemplate: CreateInstanceReactComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                exported_object_name: createExportedName,
                create_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                create_capability_app_layer_path: {
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

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(createInstanceComponentTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: createExportedName,
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.appLogicArtifact, jsonSchemaArtifact]
        }

        return presentationLayerArtifact;
    }
}