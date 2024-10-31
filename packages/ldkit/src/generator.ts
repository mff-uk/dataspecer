import {
    DataSpecification,
    DataSpecificationArtefact,
    DataSpecificationSchema
} from "@dataspecer/core/data-specification/model/index.js";
import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary.js";
import { transformStructureModel } from "@dataspecer/core/structure-model/transformation/default-transformation";
import { LdkitSchema } from "./ldkit-schema-model";
import { assertFailed, assertNot } from "@dataspecer/core/core/index";
import { ConceptualModel } from "@dataspecer/core/conceptual-model/index";
import { StructureModel } from "@dataspecer/core/structure-model/model/structure-model";
import { LdkitSchemaAdapter, StructureClassToSchemaAdapter } from "./ldkit-schema-adapter";
import { LdkitArtefactGenerator } from "./ldkit-generator";
import { convertToPascalCase } from "./utils/utils";

type LdkitSchemaGeneratorOutput = {
    schema: LdkitSchema;
    name: string;
}

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
    ): Promise<LdkitSchemaGeneratorOutput> {
        if (!DataSpecificationSchema.is(artefact)) {
            assertFailed("Invalid artefact type.");
        }

        const schemaArtefact: DataSpecificationSchema = artefact as DataSpecificationSchema;

        const conceptualModel: ConceptualModel = context.conceptualModels[specification.pim!]!;
        assertNot(
            conceptualModel === undefined,
            `Missing conceptual model ${specification.pim}.`
        );
        const mergedConceptualModel = { ...conceptualModel };
        mergedConceptualModel.classes = Object.fromEntries(
            Object.values(context.conceptualModels).map(cm => Object.entries(cm.classes)).flat()
        );

        let structureModel: StructureModel = context.structureModels[schemaArtefact.psm!]!;
        assertNot(
            structureModel === undefined,
            `Missing structure model ${schemaArtefact.psm}.`
        );

        structureModel = transformStructureModel(mergedConceptualModel, structureModel, Object.values(context.specifications));

        const ldkitSchemaAdapter: StructureClassToSchemaAdapter = new LdkitSchemaAdapter();
        const classLdkitSchema = ldkitSchemaAdapter.convertStructureModelToLdkitSchema(structureModel);
        const result: LdkitSchemaGeneratorOutput = {
            name: this.getObjectAggregateName(structureModel),
            schema: classLdkitSchema
        };

        return Promise.resolve<LdkitSchemaGeneratorOutput>(result);
    }

    async generateToStream(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification,
        output: StreamDictionary
    ): Promise<void> {

        const ldkitSchemaOutput: LdkitSchemaGeneratorOutput = (await this.generateToObject(context, artefact, specification));
        const generator = new LdkitArtefactGenerator();
        const sourcefileContent: string = generator.generateSourceFile({
            aggregateName: ldkitSchemaOutput.name,
            dataSchema: ldkitSchemaOutput.schema
        });

        const stream = output.writePath(artefact.outputPath!);
        await stream.write(sourcefileContent);
        await stream.close();
    }

    private getObjectAggregateName(structure: StructureModel) {
        if (!structure) {
            throw new Error("Missing structure model");
        }

        if (!structure!.humanLabel
            || Object.keys(structure.humanLabel).length === 0) {
            throw new Error(`Data structure "${structure.psmIri}" is missing a name.`)
        }

        const labelKeys = Object.keys(structure.humanLabel);

        const humanLabel = labelKeys.includes("en")
            ? structure.humanLabel["en"]!
            : structure.humanLabel[labelKeys.at(0)!]!;

        const aggregateName = convertToPascalCase(this.normalizeName(humanLabel));

        return aggregateName;
    }

    private normalizeName(name: string) {
        return name
            .replace(/[\s/<>:"\\|?*]+/g, "-") // Windows and Linux forbidden characters
            .toLowerCase();
    }
}
