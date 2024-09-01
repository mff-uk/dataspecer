import {
    DataSpecification,
    DataSpecificationArtefact,
    DataSpecificationSchema
} from "@dataspecer/core/data-specification/model/index.js";
import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary.js";
import { transformStructureModel } from "@dataspecer/core/structure-model/transformation/default-transformation";
import { LdkitSchema } from "./ldkit-schema-model";
import { CoreResourceReader, LanguageString, assertFailed, assertNot } from "@dataspecer/core/core/index";
import { ConceptualModel, ConceptualModelClass, ConceptualModelProperty } from "@dataspecer/core/conceptual-model/index";
import { StructureModel } from "@dataspecer/core/structure-model/model/structure-model";
import { LdkitSchemaAdapter, StructureClassToSchemaAdapter } from "./ldkit-schema-adapter";
import { LdkitArtefactGenerator } from "./ldkit-generator";
import { OutputStream } from "@dataspecer/core/io/stream/output-stream";


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
    ): Promise<LdkitSchema> {
        if (!DataSpecificationSchema.is(artefact)) {
            assertFailed("Invalid artefact type.");
        }

        const schemaArtefact: DataSpecificationSchema = artefact as DataSpecificationSchema;
        // const conceptualModel: ConceptualModel = context.conceptualModels[specification?.pim];
        // assertNot(
        //     conceptualModel === undefined,
        //     `Missing conceptual model ${specification.pim}.`
        // );
        const structureModel: StructureModel = context.structureModels[schemaArtefact.psm];
        assertNot(
            structureModel === undefined,
            `Missing structure model ${schemaArtefact.psm}.`
        );

        const ldkitSchemaAdapter: StructureClassToSchemaAdapter = new LdkitSchemaAdapter();
        const classLdkitSchema = ldkitSchemaAdapter.convertStructureModelToLdkitSchema(structureModel);

        console.log(`Ldkit schema for given class: `, classLdkitSchema);
        const result: LdkitSchema = classLdkitSchema;
        console.log("-".repeat(50));

        return Promise.resolve<LdkitSchema>(result);
    }

    async generateToStream(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification,
        output: StreamDictionary
    ): Promise<void> {
        const conceptualModel = context.conceptualModels[specification.pim!];
        const mergedConceptualModel = { ...conceptualModel! };
        mergedConceptualModel.classes = Object.fromEntries(Object.values(context.conceptualModels).map(cm => Object.entries(cm.classes)).flat());

        const structureModels = Object.fromEntries(
            Object.entries(context.structureModels)
                .map(([iri, structureModel]) => {
                    if (!structureModel) {
                        return [iri, null];
                    }

                    let transformedModel = transformStructureModel(mergedConceptualModel, structureModel, Object.values(context.specifications));
                    return [iri, transformedModel];
                })
        );

        if (!artefact.outputPath) {
            return;
        }

        console.log(context, artefact, specification, output, structureModels);

        // Example code, write file for every structure model
        for (const [iri, structureModel] of Object.entries(structureModels)) {
            if (!structureModel) {
                continue;
            }

            const ldkitSchemaAdapter: StructureClassToSchemaAdapter = new LdkitSchemaAdapter();
            const schema: LdkitSchema = ldkitSchemaAdapter.convertStructureModelToLdkitSchema(structureModel);
            console.log("Schema: ", schema);

            const generator = new LdkitArtefactGenerator();
            const aggregateName = structureModel.humanLabel["en"] ?? "DummyName";
            const sourcefileContent: string = generator.generateSourceFile({
                aggregateName: aggregateName,
                dataSchema: schema
            });

            const uuid = iri.slice(iri.lastIndexOf("/") + 1);

            const stream = output.writePath(artefact.outputPath + `${aggregateName.toLowerCase()}-${uuid}-schema.ts`);
            await stream.write(sourcefileContent);
            await stream.close();
        }
    }

    generateDalLayerArtifact() {
        console.log("Called LDKit generator");
        // TODO: get ArtefactGeneratorContext, DataSpecification, etc ... from Dataspecer
        //this.generateToStream(undefined, undefined, undefined, undefined);
    }
}