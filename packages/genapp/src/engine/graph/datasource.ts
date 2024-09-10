
export enum DataSourceType {
    Local = "local",
    JSON = "json",
    RDF = "rdf",
    XML = "xml",
    CSV = "csv"
}

type LocalDatasource = { format: DataSourceType.Local; };
type UriDatasource = {
    format: DataSourceType.JSON | DataSourceType.CSV | DataSourceType.RDF | DataSourceType.XML;
    endpoint: string;
};


export type DatasourceConfig = LocalDatasource | UriDatasource;

export type Datasource = {
    label: string;
} & DatasourceConfig;
