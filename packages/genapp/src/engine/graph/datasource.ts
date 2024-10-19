export enum DataSourceType {
    Local = "local",
    JSON = "json",
    RDF = "rdf",
    XML = "xml",
    CSV = "csv"
}

type LocalDatasource = { format: DataSourceType.Local; };

export type ReadWriteEndpointUri = {
    read: string;
    write: string;
}

export type EndpointUri = string | ReadWriteEndpointUri;

type UriDatasource = {
    format: DataSourceType.JSON | DataSourceType.CSV | DataSourceType.RDF | DataSourceType.XML;
    endpoint: EndpointUri;
};

export type DatasourceConfig = LocalDatasource | UriDatasource;

export type Datasource = {
    label: string;
} & DatasourceConfig;
