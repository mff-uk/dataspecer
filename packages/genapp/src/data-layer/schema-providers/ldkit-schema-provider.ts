import { JSZipObject } from "jszip";
import { AggregateMetadata } from "../../application-config";
import { LayerArtifact } from "../../engine/layer-artifact";
import { DataspecerBaseSchemaProvider, SchemaProvider } from "./base-schema-provider";

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
