import { JSZipObject } from "jszip";
import { AggregateMetadata } from "../../application-config";
import { LayerArtifact } from "../../engine/layer-artifact";
import { DataspecerBaseSchemaProvider, SchemaProvider } from "./base-schema-provider";

export class JsonSchemaProvider extends DataspecerBaseSchemaProvider implements SchemaProvider {

    constructor(dataSpecificationIri: string) {
        super(dataSpecificationIri, "schema.json");
    }

    async getSchemaLayerArtifact(file: JSZipObject, aggregate: AggregateMetadata): Promise<LayerArtifact> {
        const fileContent = await file.async("string");
        const result: LayerArtifact = {
            filePath: `./schemas/json/${aggregate.technicalLabel}-schema.json`,
            sourceText: fileContent,
            exportedObjectName: aggregate.getAggregateNamePascalCase({
                suffix: "JsonSchema"
            })
        }

        return result;
    }
}
