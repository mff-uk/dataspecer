import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "@dataspecer/core/data-specification/model/index.js";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary.js";
import {ArtefactGenerator, ArtefactGeneratorContext} from "@dataspecer/core/generator";
import {assertFailed, assertNot} from "@dataspecer/core/core";
import {transformStructureModel, structureModelAddDefaultValues} from "@dataspecer/core/structure-model/transformation";
import {JsonExampleAdapter} from "./json-example-adapter.js";
import {JsonLdAdapter} from "../../json/src/json-ld/json-ld-adapter.js";
import {DefaultJsonConfiguration, JsonConfiguration, JsonConfigurator} from "../../json/src/configuration";
import {JSON_SCHEMA, JsonSchemaGenerator} from "@dataspecer/json/json-schema";
import {MemoryStreamDictionary} from "@dataspecer/core/io/stream/memory-stream-dictionary.js";
import {DataSpecificationConfigurator, DefaultDataSpecificationConfiguration, DataSpecificationConfiguration} from "@dataspecer/core/data-specification/configuration";


interface JsonExampleGeneratorObject {
    data: String;
  }

export class JsonExampleGenerator implements ArtefactGenerator {
    static readonly IDENTIFIER = "https://schemas.dataspecer.com/generator/json-example";

    identifier(): string {
        return JsonExampleGenerator.IDENTIFIER;
    }

    generateForDocumentation(): Promise<unknown | null> {
        return Promise.resolve(null);
    }

    async generateToObject(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification
      ): Promise<JsonExampleGeneratorObject | null> {
        var jsonld;
        const schemaArtefact = artefact as DataSpecificationSchema;
        const configuration = JsonConfigurator.merge(
            DefaultJsonConfiguration,
            JsonConfigurator.getFromObject(schemaArtefact.configuration)
        ) as JsonConfiguration;

        if(configuration.includeContextInExample){
            if (!DataSpecificationSchema.is(artefact)) {
                assertFailed("Invalid artefact type.");
            }

            const conceptualModel = context.conceptualModels[specification.pim];
            assertNot(
                conceptualModel === undefined,
                `Missing conceptual model ${specification.pim}.`
            );
            let model = context.structureModels[schemaArtefact.psm];
            assertNot(
                model === undefined,
                `Missing structure model ${schemaArtefact.psm}.`
            );

            // Global options for the data specification
            const globalConfiguration = DataSpecificationConfigurator.merge(
                DefaultDataSpecificationConfiguration,
                DataSpecificationConfigurator.getFromObject(schemaArtefact.configuration)
            ) as DataSpecificationConfiguration;
        
            const mergedConceptualModel = {...conceptualModel};
            mergedConceptualModel.classes = Object.fromEntries(Object.values(context.conceptualModels).map(cm => Object.entries(cm.classes)).flat());
            model = transformStructureModel(mergedConceptualModel, model, Object.values(context.specifications));
            model = structureModelAddDefaultValues(model, globalConfiguration);
        
            const jsonldadapter = new JsonLdAdapter(model, context, artefact);
            jsonld = jsonldadapter.generate();
        }


        const jsonGenerator = new JsonSchemaGenerator();

        const jsonSchema = new DataSpecificationSchema();
        jsonSchema.outputPath = `schema.json`;
        const artoutpath = (artefact.outputPath == null) ? `schema.json` : artefact.outputPath;
        jsonSchema.generator = JSON_SCHEMA.Generator;
        jsonSchema.psm = (artefact as DataSpecificationSchema).psm;
        jsonSchema.configuration = {};
    
        const streamDictionary = new MemoryStreamDictionary();
        await jsonGenerator.generateToStream(context, artefact, specification, streamDictionary);
        const schema = await streamDictionary.readPath(artoutpath).read();
        const s = (schema == null) ? "schema" : schema;
        const adapter = new JsonExampleAdapter(s, context, artefact);
        if(configuration.includeContextInExample){
            const data = adapter.generate();
            const jsonldFakeData = jsonld.slice(0, -1) + "," + (await data).data.substring(1);
            return { data: jsonldFakeData };
        } else {
            return adapter.generate();
        }    
    }

    async generateToStream(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact, 
        specification: DataSpecification, 
        output: StreamDictionary
        ): Promise<void> {
            if (!artefact.outputPath) {
                throw new Error("No output path specified.");
            }

            const model = await this.generateToObject(context, artefact, specification);
            const m = (model === null) ? {data: "data"} as JsonExampleGeneratorObject  : model ;
            const stream = output.writePath(artefact.outputPath);
            await stream.write(m.data.toString());
            await stream.close();
    }
}