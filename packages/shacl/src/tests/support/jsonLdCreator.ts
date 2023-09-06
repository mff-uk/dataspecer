import {OutputStream} from "@dataspecer/core/io/stream/output-stream";
import { StructureModel } from "@dataspecer/core/structure-model/model";
  import { StringSelector } from "@dataspecer/core/core";
  import { DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
  import { DataSpecificationSchema } from "@dataspecer/core/data-specification/model";
  import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
  import { DefaultJsonConfiguration } from "@dataspecer/json/src/configuration";
  import { JsonConfiguration } from "@dataspecer/json/src/configuration";
  import  ModelCreator  from "./ClosedShapeModelCreator";
  import  ConceptualModelCreator  from "./conceptualModelCreator";
  import {ArtefactGenerator, ArtefactGeneratorContext, StructureClassLocation} from "@dataspecer/core/generator";
import { CoreResourceReader } from "@dataspecer/core/core/core-reader";
import {JsonLdGenerator} from "@dataspecer/json/src/json-ld";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary";
import {MemoryStreamDictionary} from "@dataspecer/core/io/stream/memory-stream-dictionary";
import { MemoryOutputStream } from "@dataspecer/core/io/stream/memory-output-stream";
import * as path from 'path';


interface Context {

    specification: DataSpecification;
  
    specifications: { [iri: string]: DataSpecification };
  
    stringSelector: StringSelector;
  
    model: StructureModel;
  
    artefact: DataSpecificationArtefact;
  
    configuration: JsonConfiguration;
  }

class JsonLdCreator{
    async createJsonLD(smc : StructureModel ) : Promise<Object> {
        const structureModelClass = new ModelCreator;
        const conceptualModelClass = new ConceptualModelCreator;
        const jsonconfig = DefaultJsonConfiguration;
        const spec = new DataSpecification();
        spec.pim = "https://example.com/class1/mojePimIri";
        const jsonldgen = new JsonLdGenerator();
        var artefact = new DataSpecificationSchema();
        artefact.psm = "https://example.com/class1/mojePimIri"
        artefact.outputPath = path.resolve("data-json-ld-generated.json");
        //console.log(artefact.outputPath);
        const output: StreamDictionary =  new MemoryStreamDictionary();
        const coreResourceReader : CoreResourceReader = {} as CoreResourceReader;
        const context: ArtefactGeneratorContext = {
            specifications: { ["https://example.com/class1/mojePimIri"]: spec },
            conceptualModels: { ["https://example.com/class1/mojePimIri"]: conceptualModelClass.createModel() },
            structureModels: { ["https://example.com/class1/mojePimIri"]: smc },
            reader: coreResourceReader,
            createGenerator(iri: string): Promise<ArtefactGenerator | null> { return null as any;},
            findStructureClass(iri: string): StructureClassLocation | null {return null}
          };

        const model = await jsonldgen.generateToObject(context, artefact, spec);
        //const stream = output.writePath(artefact.outputPath);
        //assert((await output.exists(artefact.outputPath)).valueOf(), "dOESNT EXIST");

        const specification = new DataSpecification();
        specification.iri = "root;";
        /*
        const actual = structureModelToJsonLd(
          { root: specification },
          specification,
          smc,
          DefaultJsonConfiguration,
          {} as DataSpecificationArtefact,
          defaultStringSelector
        );
        */
       // Good one
        console.log(JSON.stringify(model, null, 2));
        //console.log(JSON.stringify(actual, null, 2));
      const stream = new MemoryOutputStream();
        //await writeJsonLd(actual, stream);
      // Good one
        console.log(stream.getContent());
      // FOR SCHEMA OUTPUT TO STDOUT
        await writeJsonLd(model, stream);
        await stream.close();
        //const jsonSchemaGenerator = structureModelToJsonLd({ ["https://example.com/class1/mojePimIri"]: spec }, spec, structureModelClass.createModel(), jsonconfig, new DataSpecificationArtefact());
        return model;
    }
}

async function writeJsonLd(
    schema: object,
    stream: OutputStream
  ): Promise<void> {
    await stream.write(JSON.stringify(schema, undefined, 2));
    await stream.close();
  }

export default JsonLdCreator;
