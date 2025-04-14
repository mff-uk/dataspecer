import { Config, createGenerator, Schema } from "ts-json-schema-generator";
import { TemplateModel } from "../../engine/templates/template-interfaces.ts";
import { GenerationContext } from "../../engine/generator-stage-interface.ts";
import { LayerArtifact } from "../../engine/layer-artifact.ts";
import { TemplateConsumer, TemplateDependencyMap  } from "../../engine/templates/template-consumer.ts";
import { PresentationLayerGenerator } from "../strategy-interface.ts";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver.ts";
import { NodeTransitionsView, TransitionsGenerator } from "../../engine/transitions/transitions-generator.ts";
import { DetailNodeConfiguration } from "../../engine/graph/index.ts";
import { ArtifactCache } from "../../utils/artifact-saver.ts";
import { AggregateMetadata } from "../../application-config.ts";

export interface PresentationLayerDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator;
    appLogicArtifact: LayerArtifact;
    transitions: NodeTransitionsView;
    detailNodeConfig: DetailNodeConfiguration;
}

export abstract class PresentationLayerTemplateGenerator<TemplateType extends TemplateModel>
    extends TemplateConsumer<TemplateType>
    implements PresentationLayerGenerator {

    strategyIdentifier: string = "";

    protected restoreAggregateDataModelInterface(aggregate: AggregateMetadata): Schema {

        const typeModelName = aggregate.getAggregateNamePascalCase({ suffix: "ModelType" });

        const typeModelPath = ArtifactCache.content[typeModelName];

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
            tsconfig: "./tsconfig.json",
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

    async generatePresentationLayer(context: GenerationContext): Promise<LayerArtifact> {
        if (!context.previousResult) {
            const errorArtifact: LayerArtifact = {
                filePath: "",
                exportedObjectName: "ErrorPage",
                sourceText: ""
            }

            return Promise.resolve(errorArtifact);
        }

        if (!context._.pathResolver) {
            throw new Error("Missing path resolver");
        }

        const transitionsView = await (new TransitionsGenerator()
            .getNodeTransitions(context.currentNode, context.graph));

        const presentationLayerArtifact = await this.processTemplate({
            aggregate: context.aggregate,
            pathResolver: context._.pathResolver,
            appLogicArtifact: context.previousResult,
            transitions: transitionsView,
            detailNodeConfig: context.config
        } as PresentationLayerDependencyMap);

        return presentationLayerArtifact;
    }
}