import {
    DataSpecification,
    DataSpecificationArtefact
} from "@dataspecer/core/data-specification/model/index.js";
import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary.js";
import { transformStructureModel } from "@dataspecer/core/structure-model/transformation/default-transformation";

export class LDkitGenerator implements ArtefactGenerator {
    static readonly IDENTIFIER = "https://schemas.dataspecer.com/generator/LDkit";

    identifier(): string {
        return LDkitGenerator.IDENTIFIER;
    }

    generateForDocumentation(): Promise<unknown | null> {
        // There is no need to generate documentation for this generator
        return Promise.resolve(null);
    }

    async generateToObject(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification
    ): Promise<never> {
        // Not necessary for this generator
        throw new Error("Method not implemented.");
    }

    async generateToStream(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact, 
        specification: DataSpecification, 
        output: StreamDictionary
    ): Promise<void> {
        const conceptualModel = context.conceptualModels[specification.pim!];
        let structureModel = context.structureModels;

        const mergedConceptualModel = {...conceptualModel!};
        mergedConceptualModel.classes = Object.fromEntries(Object.values(context.conceptualModels).map(cm => Object.entries(cm.classes)).flat());

        const structureModels = Object.fromEntries(Object.entries(context.structureModels).map(([iri, structureModel]) => {
            let transformedModel = transformStructureModel(mergedConceptualModel, structureModel, Object.values(context.specifications));
            return [iri, transformedModel];
        }));

        if (!artefact.outputPath) {
            return;
        }

        // Example code, write file for every structure model
        for (const [iri, structureModel] of Object.entries(structureModels)) {
            const lastChunk = iri.split("/").pop();
            const stream = output.writePath(artefact.outputPath! + lastChunk + ".txt");
            await stream.write(JSON.stringify(structureModel));
            await stream.close();
        }
    }
}