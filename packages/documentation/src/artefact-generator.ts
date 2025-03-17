import { DataSpecification, DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";
import { DefaultTemplateArtifactConfiguration, TemplateArtifactConfiguration, TemplateArtifactConfigurator } from "./configuration";
import { getMustacheView } from "./mustache-view/views";
import { createHandlebarsAdapter } from "@dataspecer/handlebars-adapter";

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

        // get only last part after slash

        const adapter = createHandlebarsAdapter();

        const view = getMustacheView({
            context,
            artefact,
            specification,
        }, adapter);

        // @ts-ignore
        view.language = "cs";

        const result = await adapter.render(template, view, templates);

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
