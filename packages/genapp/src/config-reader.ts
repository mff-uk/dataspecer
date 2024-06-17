import * as fs from "fs";
import { AggregateConfiguration, ApplicationConfiguration, CapabilityConfiguration, DataSourceType } from "./application-config";

export interface ConfigurationReader<TConfiguration extends ApplicationConfiguration> {
    getAppConfiguration(): TConfiguration;
    getRootAggregateNames(): string[];
    getAggregateConfiguration(aggregateName: string): AggregateConfiguration;
}

export class StaticConfigurationReader implements ConfigurationReader<ApplicationConfiguration> {

    private readonly _configuration: ApplicationConfiguration;

    constructor() {
        this._configuration = {
            "Dataset": {
                datasource: {
                    format: DataSourceType.Rdf,
                    endpointUri: "https://data.gov.cz/sparql"
                },
                capabilities: {
                    list: {
                        id: "dataset_list_id",
                        type: "collection",
                        showHeader: true,
                        showAsPopup: false,
                        hasFilter: true,
                        hasSearch: true,
                        hasAllSelection: true
                    },
                    detail: {
                        id: "dataset_detail_id",
                        type: "instance",
                        showHeader: true,
                        showAsPopup: false,
                        hasFilter: false,
                        hasSearch: false,
                        hasAllSelection: false
                    }
                }
            },
            "Catalog": {
                datasource: {
                    format: DataSourceType.Rdf,
                    endpointUri: "https://data.gov.cz/sparql"
                },
                capabilities: {
                    list: {
                        id: "catalog_list_id",
                        type: "collection",
                        showHeader: true,
                        showAsPopup: false,
                        hasFilter: true,
                        hasSearch: true,
                        hasAllSelection: true
                    }
                }
            },
            // "Catalog": {
            //     datasource: { 
            //         format: DataSourceType.Rdf,
            //         endpointUri: "https://data.gov.cz/sparql"
            //     },
            //     capabilities: {
            //         list: {
            //             id: "catalog_list",
            //             type: "aggregate",
            //             showHeader: true,
            //             showAsPopup: false,
            //             hasFilter: true,
            //             hasSearch: true,
            //             hasAllSelection: true
            //         }
            //     }
            // },
            // "Distribution": {
            //     datasource: { 
            //         format: DataSourceType.Rdf,
            //         endpointUri: "https://data.gov.cz/sparql"
            //     },
            //     capabilities: {
            //         list: {
            //             id: "catalog_list",
            //             type: "aggregate",
            //             showHeader: true,
            //             showAsPopup: false,
            //             hasFilter: true,
            //             hasSearch: true,
            //             hasAllSelection: true
            //         }
            //     }
            // }
        } as ApplicationConfiguration;
    }

    getRootAggregateNames(): string[] {
        return Object.keys(this._configuration);
    }

    getAppConfiguration(): ApplicationConfiguration {
        return this._configuration;
    }

    getAggregateConfiguration(aggregateName: string): AggregateConfiguration {
        const aggConfig = this._configuration[aggregateName];

        if (!aggConfig) {
            throw new Error(`No configuration has been found for "${aggregateName}".`);
        }

        return aggConfig;
    }
}

export class FileConfigurationReader implements ConfigurationReader<ApplicationConfiguration> {

    private readonly _configFilePath: string;
    private _configuration: ApplicationConfiguration;

    constructor(configFilePath: string) {
        this._configFilePath = configFilePath;
        this._configuration = {} as ApplicationConfiguration;
    }

    getRootAggregateNames(): string[] {
        return Object.keys(this._configuration);
    }

    getAppConfiguration(): ApplicationConfiguration {

        const fileContent = fs
            .readFileSync(this._configFilePath)
            .toString();

        this._configuration = JSON.parse(fileContent) as ApplicationConfiguration;

        return this._configuration;
    }

    getAggregateConfiguration(aggregateName: string): AggregateConfiguration {
        const aggConfig = this._configuration[aggregateName];

        if (!aggConfig) {
            throw new Error(`No configuration has been found for "${aggregateName}".`);
        }

        return aggConfig;
    }
}