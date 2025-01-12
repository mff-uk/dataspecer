import { JSZipObject } from "jszip";
import { AggregateMetadata } from "../../application-config";
import { LayerArtifact } from "../../engine/layer-artifact";
import { DataspecerBaseSchemaProvider, SchemaProvider } from "./base-schema-provider";

export class LdkitSchemaProvider extends DataspecerBaseSchemaProvider implements SchemaProvider {

    constructor(dataSpecificationIri: string) {
        super(dataSpecificationIri, "ldkit-schema.ts");
    }

    /**
     * Generates a layer artifact which contains the data schema for the specified aggregate.
     * This instance generates an artifact which contains the LDkit schema of the aggregate.
     *
     * @param file - The JSZipObject representing the file to be processed.
     * @param aggregate - The aggregate metadata for which the schema is being generated.
     * @returns A promise that resolves to a LayerArtifact containing the schema details.
     */
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
