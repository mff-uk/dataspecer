
type DatasourceConfig = { format: "local" } | {
    format: "json" | "rdf" | "xml" | "csv",
    endpointUri: string
};

type CapabilityIdentifier = string;

export type DatasourceConfigMap = { [aggregateIdentifier: string]: DatasourceConfig[] }

export type CapabilityConfigMap = { [aggregateIdentifier: string]: CapabilityIdentifier[] }

export interface ApplicationConfiguration {
    targetLanguage: "ts",
    datasources: DatasourceConfigMap,
    capabilities: CapabilityConfigMap
}