import { Config, createGenerator, Schema } from "ts-json-schema-generator";
import { TemplateModel } from "../../engine/templates/template-interfaces";
import { GenerationContext } from "../../engine/generator-stage-interface";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer";
import { PresentationLayerGenerator } from "../strategy-interface";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver";
import { NodeTransitionsView, TransitionsGenerator } from "../../engine/transitions/transitions-generator";
import { DetailNodeConfiguration } from "../../engine/graph";
import { ArtifactCache } from "../../utils/artifact-saver";
import { AggregateMetadata } from "../../application-config";

export interface PresentationLayerDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator;
    appLogicArtifact: LayerArtifact;
    transitions: NodeTransitionsView;
    detailNodeConfig: DetailNodeConfiguration;
}

/**
 * An abstract base class that defines a the base for presentation layer artifact generators
 * which use template population approach. The class extends the generic {@link TemplateConsumer}
 * to reuse shared functionality for populating templates. Additionally, it implements the
 * {@link PresentationLayerGenerator} interface to provide the methods used within the presentation layer
 * generation process.
 *
 * The {@link PresentationLayerTemplateGenerator} is the base class for concrete
 * presentation layer template processors. Each derived class generates the source code
 * for a specific capability by providing its own template and values for the required placeholders.
 *
 * @see {@link CreateInstanceComponentTemplateProcessor}
 * @see {@link DeleteInstanceComponentTemplateProcessor}
 * @see {@link DetailComponentTemplateProcessor}
 * @see {@link EditInstanceComponentTemplateProcessor}
 * @see {@link ListTableTemplateProcessor}
 */
export abstract class PresentationLayerTemplateGenerator<TemplateType extends TemplateModel>
    extends TemplateConsumer<TemplateType>
    implements PresentationLayerGenerator {

    strategyIdentifier: string = "";

    /**
     * Restores the data model interface for an aggregate and converts it to the corresponding JSON schema.
     *
     * @param aggregate - The metadata of the aggregate for which the data model interface needs to be restored.
     * @returns The restored schema as a JSON Schema object.
     */
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

    /**
     * Converts an LDkit schema type to a JSON schema.
     *
     * @param ldkitSchemaTypeName - The name of the LDkit schema type to convert.
     * @param ldkitSchemaTypeFilePath - The file path to the LDkit schema type.
     * @returns The converted JSON schema.
     */
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

    /**
     * Manages the presentation layer artifact generation process which is invoked within the presentation layer
     * generation stage.
     *
     * @param context - The generation context which contains necessary data including the application graph context.
     * @returns A promise that resolves to a `LayerArtifact` representing the generated presentation layer.
     */
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