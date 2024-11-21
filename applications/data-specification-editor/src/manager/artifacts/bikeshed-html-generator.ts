import { BIKESHED } from "@dataspecer/bikeshed";
import { DataSpecification, DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { MemoryStreamDictionary } from "@dataspecer/core/io/stream/memory-stream-dictionary";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";

export interface ExtendsArtefact {
    /**
     * IRI of the generator that is extended by this artefact.
     */
    extends?: string;
}

/**
 * This artefact generator generates a bikeshed documentation in HTML using
 * external service. It extends (in terms of artefact generation) the
 * {@link BikeshedGenerator}.
 */
export class BikeshedHtmlGenerator implements ArtefactGenerator {
    static readonly IDENTIFIER = BIKESHED.Generator + "/html-output";

    identifier(): string {
        return BikeshedHtmlGenerator.IDENTIFIER;
    }

    generateForDocumentation(): null {
        return null;
    }

    generateToObject(): never {
        throw new Error("Method not implemented.");
    }

    async generateToStream(
      context: ArtefactGeneratorContext,
      artefact: DataSpecificationArtefact & ExtendsArtefact,
      specification: DataSpecification,
      output: StreamDictionary,
    ): Promise<void> {
        const bikeshedGenerator = await context.createGenerator(artefact.extends ?? BIKESHED.Generator);
        if (!bikeshedGenerator) {
            throw new Error("Bikeshed generator not found.");
        }
        const stream = new MemoryStreamDictionary();
        await bikeshedGenerator.generateToStream(
          context, artefact, specification, stream
        );

        const bikeshed = await stream.readPath((await stream.list())[0]).read();

        console.log(bikeshed);

        const html = await this.generateFromSource(bikeshed);

        if (html) {
            const stream = output.writePath(artefact.outputPath as string);
            // @ts-ignore
            await stream.write(html);
            await stream.close();
        }
    }

    private async generateFromSource(source: string): Promise<string | null> {
        try {
            const response = await fetch(
              `${import.meta.env.VITE_BACKEND}/transformer/bikeshed`,
              {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain",
                },
                body: source,
              }
            );

            if (response.status !== 200) {
                console.warn(`Unable to generate bikeshed HTML: ${response.status}. Server response follows.`);
                console.info(await response.text());
                return null;
            }

            return await response.text();
        } catch (error) {
            console.warn(`Unable to generate bikeshed HTML due to network error.`);
            console.error(error);
        }

        return null;
    }
}
