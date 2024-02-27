export type DatasourceConfig = { }

export type CapabilityConfig = { }

export type ApplicationConfiguration = {
    targetLanguage: "ts",
    datasources: DatasourceConfig[],
    capabilities: CapabilityConfig[]
}

export interface ConfigurationReader<TConfiguration> {
    getAppConfiguration(): TConfiguration;
}

export class GenAppConfigurationReader implements ConfigurationReader<ApplicationConfiguration> {

    private appConfigInstance: ApplicationConfiguration = {
        targetLanguage: "ts",
        datasources: [],
        capabilities: []
    };

    getAppConfiguration(): ApplicationConfiguration {
        return this.appConfigInstance;
    }
}