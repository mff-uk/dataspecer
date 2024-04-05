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
    // TODO: ako mapovat nazvy fieldov na obrazovke? 
    aggregateName: string;
    dataSchema: LdkitSchema
}