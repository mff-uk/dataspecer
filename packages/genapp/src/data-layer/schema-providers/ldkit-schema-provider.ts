import { JSZipObject } from "jszip";
import { AggregateMetadata } from "../../application-config.ts";
import { LayerArtifact } from "../../engine/layer-artifact.ts";
import { DataspecerBaseSchemaProvider, SchemaProvider } from "./base-schema-provider.ts";

export class LdkitSchemaProvider extends DataspecerBaseSchemaProvider implements SchemaProvider {

    constructor(dataSpecificationIri: string) {
        super(dataSpecificationIri, "ldkit-schema.ts");
    }

    protected async getSchemaLayerArtifact(file: JSZipObject, aggregate: AggregateMetadata): Promise<LayerArtifact> {
        const fileContent = await file.async("string");
        const ldkitSchemaArtifact: LayerArtifact = {
            filePath: `./schemas/ldkit/${aggregate.technicalLabel}-schema.ts`,
            sourceText: fileContent,
            exportedObjectName: aggregate.getAggregateNamePascalCase({
                suffix: "Schema"
            })
        }

        return ldkitSchemaArtifact;
    }
}
