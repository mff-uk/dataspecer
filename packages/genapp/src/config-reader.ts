import { ApplicationConfiguration, DataSourceType } from "./application-config";

export interface ConfigurationReader<TConfiguration extends ApplicationConfiguration> {
    getAppConfiguration(): TConfiguration;
}

export class GenAppConfigurationReader implements ConfigurationReader<ApplicationConfiguration> {

    private appConfigInstance: ApplicationConfiguration = {
        targetLanguage: "ts",
        datasources: {
            "Catalog": [
                {
                    format: DataSourceType.Rdf,
                    endpointUri: "https://data.gov.cz/sparql"
                }
            ],
            "Dataset": [
                {
                    format: DataSourceType.Rdf,
                    endpointUri: "https://data.gov.cz/sparql"
                }
            ]
        },
        capabilities: {
            "Catalog": [
                "overview"
            ],
            "Dataset": [
                "overview"
            ]
        }
    };

    getAppConfiguration(): ApplicationConfiguration {
        return this.appConfigInstance;
    }
}