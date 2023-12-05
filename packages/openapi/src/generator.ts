import {
  DataSpecification,
  DataSpecificationArtefact,
} from "@dataspecer/core/data-specification/model/index.js";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary.js";
import {ArtefactGenerator, ArtefactGeneratorContext} from "@dataspecer/core/generator";
import { stringify } from "yaml";

export class OpenapiGenerator implements ArtefactGenerator {
    static readonly IDENTIFIER = "https://schemas.dataspecer.com/generator/openapi";

    identifier(): string {
        return OpenapiGenerator.IDENTIFIER;
    }

    generateForDocumentation(): Promise<unknown | null> {
        return Promise.resolve(null);
    }

    async generateToObject(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification
    ): Promise<never> {
        throw new Error("Method not implemented.");
    }

    async generateToStream(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact, 
        specification: DataSpecification, 
        output: StreamDictionary
    ): Promise<void> {
        if (!artefact.outputPath) {
            return;
        }

        const stream = output.writePath(artefact.outputPath!);
        // Just stringify everything so we can see what we're getting
        await stream.write(stringify(JSON.parse(JSON.stringify({
            context,
            artefact,
            specification,
            output
        }))));
        await stream.close();
    }
}