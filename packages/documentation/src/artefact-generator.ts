import { DataSpecification, DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";
import { DefaultTemplateArtifactConfiguration, TemplateArtifactConfiguration, TemplateArtifactConfigurator } from "./configuration";
import { getMustacheView } from "./mustache-view/views";
import { createHandlebarsAdapter } from "@dataspecer/handlebars-adapter";
import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { defaultConfiguration, DocumentationGeneratorConfiguration, DocumentationGeneratorInputModel, generateDocumentation } from "./documentation-generator";

/**
 * ArtefactGenerator implementation for template artifact generator.
 */
export class TemplateArtifactGenerator implements ArtefactGenerator {
    static readonly IDENTIFIER = "https://schemas.dataspecer.com/generator/template-artifact";
    identifier(): string {
        return TemplateArtifactGenerator.IDENTIFIER;
    }

    async generateToStream(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification,
        output: StreamDictionary
    ): Promise<void> {
        const configuration = TemplateArtifactConfigurator.merge(
            DefaultTemplateArtifactConfiguration,
            TemplateArtifactConfigurator.getFromObject(artefact.configuration)
        ) as TemplateArtifactConfiguration;

        const template = configuration.template;
        const templates = configuration.templates;

        // todo: I need to somehow obtain the original models..

        // @ts-ignore types
        const semanticModel = specification.semanticModel.rawModels as {
            model: {
              entities: Record<string, SemanticModelEntity>;
            },
            otherModels: {
              entities: Record<string, SemanticModelEntity>;
            }[];
          };

        const contextForDocumentation: DocumentationGeneratorInputModel = {
            label: {}, // todo
            models: [
                {
                    isPrimary: true,
                    baseIri: null,
                    entities: semanticModel.model.entities,
                    documentationUrl: "todo", // todo
                },
                ...semanticModel.otherModels.map((model) => ({
                    isPrimary: false,
                    baseIri: null,
                    entities: model.entities,
                    documentationUrl: "todo", // todo
                })),
            ],
            externalArtifacts: {},
            dsv: {},
            prefixMap: {},
        };
        const configurationForDocumentation: DocumentationGeneratorConfiguration = {
            ...defaultConfiguration
        };

        const result = await generateDocumentation(
            contextForDocumentation,
            configurationForDocumentation,
            adapter => getMustacheView({
                context,
                artefact,
                specification,
            }, adapter)
        );

        const stream = output.writePath(artefact.outputPath);
        stream.write(result);
        await stream.close();
    }

    generateToObject(): Promise<never> {
        // Not applicable for this generator - can not even be called
        throw new Error("Method not implemented.");
    }

    async generateForDocumentation(): Promise<null> {
        // Not applicable for this generator => return null
        return null;
    }
}
