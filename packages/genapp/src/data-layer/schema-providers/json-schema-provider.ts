import { JSZipObject } from "jszip";
import { AggregateMetadata } from "../../application-config.ts";
import { LayerArtifact } from "../../engine/layer-artifact.ts";
import { DataspecerBaseSchemaProvider, SchemaProvider } from "./base-schema-provider.ts";

export class JsonSchemaProvider extends DataspecerBaseSchemaProvider implements SchemaProvider {

    constructor(dataSpecificationIri: string) {
        super(dataSpecificationIri, "schema.json");
    }

    protected async getSchemaLayerArtifact(file: JSZipObject, aggregate: AggregateMetadata): Promise<LayerArtifact> {
        const fileContent = await file.async("string");
        const jsonSchemaArtifact: LayerArtifact = {
            filePath: `../schemas/json/${aggregate.technicalLabel}-schema.json`,
            sourceText: fileContent,
            exportedObjectName: aggregate.getAggregateNamePascalCase({
                suffix: "JsonSchema"
            })
        }

        return jsonSchemaArtifact;
    }
}
