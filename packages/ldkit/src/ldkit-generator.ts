import { JsonSchemaDataProvider } from "./readers/jsonschema-data-providers.ts";
import { LdkitSchema, LdkitSchemaPropertyMap } from "./ldkit-schema-model.ts";
import { AggregateDefinitionProvider, AggregateIdentifier, AggregateMetadata } from "./readers/aggregate-data-provider-model.ts";
import { getSupportedWriter } from "./utils/utils.ts";
import { SourceCodeWriter } from "./writers/source-code-writer-model.ts";

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

    generateSourceFile(metadata: AggregateMetadata): string {
        return this.writer.getSourceCodeFromMetadata(metadata);
    }
}