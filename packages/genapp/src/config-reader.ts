export type DatasourceConfig = {

}

export type CapabilityConfig = {

}

export type GeneratedApplicationConfiguration = {
    targetLanguage: "ts",
    datasources: DatasourceConfig[],
    capabilities: CapabilityConfig[]
}

export interface ConfigurationReader<TConfiguration> {
    getAppConfiguration(): TConfiguration;
}

export class GenAppConfigurationReader implements ConfigurationReader<GeneratedApplicationConfiguration> {
    getAppConfiguration(): GeneratedApplicationConfiguration {
        throw new Error("Method not implemented.");
    }
}