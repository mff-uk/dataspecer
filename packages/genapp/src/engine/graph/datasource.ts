
export enum DataSourceType {
    Local,
    Json,
    Rdf,
    Xml,
    Csv
}

type LocalDatasource = { format: DataSourceType.Local; };
type UriDatasource = {
    format: DataSourceType.Json | DataSourceType.Csv | DataSourceType.Rdf | DataSourceType.Xml;
    endpoint: string;
};


export type DatasourceConfig = LocalDatasource | UriDatasource;

export type Datasource = {
    label: string;
} & DatasourceConfig;
