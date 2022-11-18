import {ArtefactGenerator, ArtefactGeneratorContext} from "@dataspecer/core/generator";
import {Bikeshed, BIKESHED, writeBikeshed} from "@dataspecer/bikeshed";
import {DataSpecification, DataSpecificationArtefact} from "@dataspecer/core/data-specification/model";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary";
import {MemoryOutputStream} from "@dataspecer/core/io/stream/memory-output-stream";

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

    generateForDocumentation(): never {
        throw new Error("Method not implemented.");
    }

    generateToObject(): never {
        throw new Error("Method not implemented.");
    }

    async generateToStream(
      context: ArtefactGeneratorContext,
      artefact: DataSpecificationArtefact,
      specification: DataSpecification,
      output: StreamDictionary,
    ): Promise<void> {
        const bikeshedGenerator = await context.createGenerator(BIKESHED.Generator);
        if (!bikeshedGenerator) {
            throw new Error("Bikeshed generator not found.");
        }
        const bikeshed = await bikeshedGenerator.generateToObject(
          context, artefact, specification
        ) as Bikeshed;

        const data = new MemoryOutputStream();
        await writeBikeshed(bikeshed, data);

        const html = await this.generateFromSource(data.getContent());

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
              `${process.env.REACT_APP_BACKEND}/transformer/bikeshed`,
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
