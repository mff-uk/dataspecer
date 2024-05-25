export enum DataSourceType {
    Local,
    Json,
    Rdf,
    Xml,
    Csv
}

export type LocalDatasource = { format: DataSourceType.Local }
export type UriDatasource = {
    format: DataSourceType.Json | DataSourceType.Csv | DataSourceType.Rdf | DataSourceType.Xml,
    endpointUri: string
};

export type DatasourceConfig = LocalDatasource | UriDatasource;

export interface ApplicationConfiguration {
    // TODO: Add target language property
    [aggregateIdentifier: string]: AggregateConfiguration;
}

export interface AggregateConfiguration {
    datasource: DatasourceConfig,
    capabilities: CapabilityConfigurationMap
}

export interface CapabilityConfigurationMap {
    [capabilityIdentifier: string]: CapabilityConfiguration;
}

export type CapabilityType = "collection" | "instance";

export interface CapabilityConfiguration {
    id: string;
    type: CapabilityType;
    showHeader: boolean;
    showAsPopup: boolean;
    hasFilter: boolean;
    hasSearch: boolean;
    hasAllSelection: boolean;

    component?: string;
    handler?: () => void;
    links?: Record<string, string>;
    properties?: Record<string, string>;
}

interface CollectionCapabilityConfiguration extends CapabilityConfiguration {
    type: "collection";
}

interface InstanceCapabilityConfiguration extends CapabilityConfiguration {
    type: "instance";
}