import {CoreResource, CoreResourceReader} from "@model-driven-data/core/core";
import {Generator} from "@model-driven-data/core/generator";
import {ZipStreamDictionary} from "./zip-stream-dictionary";
import {PlantUmlGenerator} from "@model-driven-data/core/plant-uml";
import {BikeshedGenerator} from "@model-driven-data/core/bikeshed";
import {StreamDictionary} from "@model-driven-data/core/io/stream/stream-dictionary";
import {JsonSchemaGenerator} from "@model-driven-data/core/json-schema/json-schema-generator";
import {XmlSchemaGenerator} from "@model-driven-data/core/xml-schema";
import {PlantUmlImageGenerator} from "./plant-uml-image-generator";
import {BikeshedHtmlGenerator} from "./bikeshed-html-generator";
import {DataSpecifications} from "../data-specifications";

async function writeToStreamDictionary(
  streamDictionary: StreamDictionary,
  path: string,
  data: string,
  ) {
    const stream = streamDictionary.writePath(path);
    await stream.write(data);
    await stream.close();
}

export class DefaultArtifactBuilder {
    private readonly store: CoreResourceReader;
    private readonly dataSpecifications: DataSpecifications;

    public constructor(store: CoreResourceReader, dataSpecifications: DataSpecifications) {
        this.store = store;
        this.dataSpecifications = dataSpecifications;
    }

    public async build(dataSpecificationIris: string[]): Promise<Blob> {
        const zip = new ZipStreamDictionary();

        await this.writeReadme(zip);
        await this.writeArtifacts(
          zip,
          dataSpecificationIris,
        );
        await this.writeStore(zip);

        return zip.save();
    }

    private async writeReadme(writer: ZipStreamDictionary) {
        const stream = await writer.writePath("README.md");
        await stream.write(`Tento dokument byl vygenerován ${new Date().toLocaleString("cs-CZ")}.`);
        await stream.close();
    }

    private async writeArtifacts(
      zip: ZipStreamDictionary,
      dataSpecificationIris: string[],
    ) {
        await writeToStreamDictionary(
          zip,
          "resources/data_specifications.json",
          JSON.stringify(this.dataSpecifications, null, 4),
        );

        const generator = new Generator(
          Object.values(this.dataSpecifications),
          this.store,
          [
            new JsonSchemaGenerator(),
            new XmlSchemaGenerator(),
            new BikeshedGenerator(),
            new PlantUmlGenerator(),

            new PlantUmlImageGenerator(),
            new BikeshedHtmlGenerator(),
          ]
        );

        for (const dataSpecificationIri of dataSpecificationIris) {
            try {
                await generator.generate(dataSpecificationIri, zip);
            } catch (e) {
                console.warn(`Failed to generate artifacts for specification: ${dataSpecificationIri}. The generate() method thrown. The result may be incomplete. See the error below.`);
                console.error(e);
            }
        }
    }

    private async writeStore(streamDictionary: StreamDictionary) {
        const resources = await this.store.listResources();
        const rawStore: {
            [iri: string]: CoreResource | null;
        } = {};
        for (const iri of resources) {
            rawStore[iri] = await this.store.readResource(iri);
        }

        await writeToStreamDictionary(
          streamDictionary,
          "resources/merged_store.json",
          JSON.stringify(rawStore, null, 4),
        );
    }
}
