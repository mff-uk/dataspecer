import { JsonSchemaDataProvider } from "./readers/jsonschema-data-providers";
import { LdkitSchema, LdkitSchemaPropertyMap } from "./ldkit-schema-model";
import { AggregateDefinitionProvider, AggregateIdentifier, AggregateMetadata } from "./readers/aggregate-data-provider-model";
import { getSupportedWriter } from "./utils/utils";
import { SourceCodeWriter } from "./writers/source-code-writer-model";

export class LdkitArtefactGenerator {

    private writer: SourceCodeWriter;
    private dataProvider: AggregateDefinitionProvider | null = null;

    constructor() {
        this.writer = getSupportedWriter("ts");
    }

    generateToObject(aggregateName: string): Promise<AggregateMetadata> { 

        if (!this.dataProvider) {
            this.dataProvider = new JsonSchemaDataProvider(aggregateName);
        }

        const aggregateIdentifier: AggregateIdentifier = this.dataProvider.getAggregateIdentifier();
        const properties: LdkitSchemaPropertyMap = this.dataProvider.getAggregateProperties();

        const schema: LdkitSchema = {
            "@type": aggregateIdentifier.iri,
            ...properties
        } as LdkitSchema;

        const result: AggregateMetadata = {
            aggregateName: aggregateIdentifier.name,
            dataSchema: schema
        };
        //console.log("Object generation result: ", result);

        return Promise.resolve(result);
    }

    generateToSourceFile(metadata: AggregateMetadata) {
        this.writer.getSourceCodeFromMetadata(metadata);
    }
}