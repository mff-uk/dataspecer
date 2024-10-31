export enum DataSourceType {
    Local = "local",
    JSON = "json",
    RDF = "rdf",
    XML = "xml",
    CSV = "csv"
}

type LocalDatasource = {
    /**
     * Format enumeration value. One of: "local", "json", "rdf", "xml", "csv"
     */
    format: DataSourceType.Local;
};

export type ReadWriteEndpointUri = {
    /**
     * URI of the endpoint which contains data in specified format. This endpoint will only be used for read operations.
     */
    read: string;

    /**
     * URI of the endpoint which contains data in specified format. This endpoint will only be used for write operations.
     */
    write: string;
}

export type EndpointUri = string | ReadWriteEndpointUri;

type UriDatasource = {
    /**
     * Format enumeration value. One of: "local", "json", "rdf", "xml", "csv"
     */
    format: DataSourceType.JSON | DataSourceType.CSV | DataSourceType.RDF | DataSourceType.XML;

    /**
     * URI of the endpoint which contains data in specified format. This endpoint will be used for both (read and write) operations.
     */
    endpoint: EndpointUri;
};

export type DatasourceConfig = LocalDatasource | UriDatasource;

export type Datasource = {
    /**
     * Name of the datasource.
     */
    label: string;
} & DatasourceConfig;
