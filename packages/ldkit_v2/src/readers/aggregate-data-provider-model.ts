import { LdkitSchema, LdkitSchemaPropertyMap } from "../ldkit-schema-model";

export interface AggregateIdentifier {
    name: string,
    iri: string
}

export interface AggregateDefinitionProvider {
    getAggregateIdentifier(): AggregateIdentifier;
    getAggregateProperties(): LdkitSchemaPropertyMap;
}

export type AggregateMetadata = {
    aggregateName: string;
    dataSchema: LdkitSchema
}