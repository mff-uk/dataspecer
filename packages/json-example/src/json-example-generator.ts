import {DataSpecification, DataSpecificationArtefact,} from "@dataspecer/core/data-specification/model";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary";
import {ArtefactGenerator, ArtefactGeneratorContext} from "@dataspecer/core/generator";

export class JsonExampleGenerator implements ArtefactGenerator {
    static readonly IDENTIFIER = "https://schemas.dataspecer.com/generator/json-example";

    identifier(): string {
        return JsonExampleGenerator.IDENTIFIER;
    }

    generateForDocumentation(): Promise<unknown | null> {
        return Promise.resolve(null);
    }

    generateToObject(): Promise<unknown | null> {
        return Promise.resolve(null);
    }

    async generateToStream(context: ArtefactGeneratorContext, artefact: DataSpecificationArtefact, specification: DataSpecification, output: StreamDictionary): Promise<void> {
        if (!artefact.outputPath) {
            throw new Error("No output path specified.");
        }

        const stream = output.writePath(artefact.outputPath);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await stream.write("hello");
        await stream.close();
    }
}