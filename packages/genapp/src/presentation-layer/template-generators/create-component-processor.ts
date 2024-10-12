import { LayerArtifact } from "../../engine/layer-artifact";
import { PresentationLayerDependencyMap, PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator";
import { ImportRelativePath, TemplateDescription } from "../../engine/templates/template-interfaces";
import { ApplicationGraphEdgeType } from "../../engine/graph";
import { AllowedTransition } from "../../engine/transitions/transitions-generator";
import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { ArtifactCache } from "../../utils/artifact-saver";
import { AggregateMetadata } from "../../application-config";
import { Config, createGenerator, Schema } from "ts-json-schema-generator";

interface CreateInstanceReactComponentTemplate extends TemplateDescription {
    placeholders: {
        exported_object_name: string;
        create_capability_app_layer: string,
        create_capability_app_layer_path: ImportRelativePath,
        json_schema: string,
        navigation_hook: string,
        navigation_hook_path: ImportRelativePath,
        redirects: AllowedTransition[];
    };
}

export class CreateInstanceComponentTemplateProcessor extends PresentationLayerTemplateGenerator<CreateInstanceReactComponentTemplate> {
    strategyIdentifier: string = "create-react-component-generator";

    private static readonly _createComponentTemplatePath: string = "./create/presentation-layer/create-instance-component";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: CreateInstanceComponentTemplateProcessor._createComponentTemplatePath
        })
    }

    private restoreAggregateDataModelInterface(aggregate: AggregateMetadata): Schema {

        const typeModelName = aggregate.getAggregateNamePascalCase({ suffix: "ModelType" });

        const typeModelPath = ArtifactCache.savedArtifactsMap[typeModelName];

        if (!typeModelPath) {
            return {} as Schema;
        }

        const convertedSchema = this.convertLdkitSchemaTypeToJsonSchema(typeModelName, typeModelPath);
        console.log(convertedSchema);

        return convertedSchema;
    }

    private convertLdkitSchemaTypeToJsonSchema(ldkitSchemaTypeName: string, ldkitSchemaTypeFilePath: string): Schema {
        const config: Config = {
            path: ldkitSchemaTypeFilePath,
            type: ldkitSchemaTypeName,
            // mocks tsconfig for generated model type
            tsconfig: "./tsconfig.json.txt",
            skipTypeCheck: true
        };

        try {
            const tsJsonConverter = createGenerator(config);
            const convertedJsonSchema = tsJsonConverter.createSchema(config.type);
            return convertedJsonSchema;
        } catch (error) {
            console.error(error);
            return {} as Schema;
        }
    }

    async processTemplate(dependencies: PresentationLayerDependencyMap): Promise<LayerArtifact> {

        const createExportedName = dependencies.aggregate.getAggregateNamePascalCase({
            prefix: "Create",
            suffix: "Instance"
        });

        const dataSchemaInterface = this.restoreAggregateDataModelInterface(dependencies.aggregate);

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
                json_schema: JSON.stringify(dataSchemaInterface, null, 2),
            }
        }

        const instanceDetailComponentRender = this._templateRenderer.renderTemplate(createInstanceComponentTemplate);

        const presentationLayerArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: createExportedName,
            sourceText: instanceDetailComponentRender,
            dependencies: [dependencies.appLogicArtifact]
        }

        return presentationLayerArtifact;
    }
}