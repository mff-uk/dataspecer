export enum DataSourceType {
    Local,
    Json,
    Rdf,
    Xml,
    Csv
}

export type DatasourceConfig = { format: DataSourceType.Local } | {
    format: DataSourceType.Json | DataSourceType.Csv | DataSourceType.Rdf | DataSourceType.Xml,
    endpointUri: string
};

export type CapabilityIdentifier = "overview" | "detail"; // TODO: add remaining

export type DatasourceConfigMap = { [aggregateIdentifier: string]: DatasourceConfig[] }

export type CapabilityConfigMap = { [aggregateIdentifier: string]: CapabilityIdentifier[] }

export interface ApplicationConfiguration {
    targetLanguage: "ts",
    datasources: DatasourceConfigMap,
    capabilities: CapabilityConfigMap
}

//------------------------------------------------------------------

export type AggregateConfiguration = {
    datasource: DatasourceConfig,
    capabilities: CapabilityIdentifier[]
}

export type AvailableTargetLanguages = "ts"

export interface AlternateApplicationConfiguration {
    // TODO: Add target language property
    [aggregateIdentifier: string]: AggregateConfiguration,
}
