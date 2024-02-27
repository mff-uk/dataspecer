import { ApplicationConfiguration } from "../application-config";
import { ConfigurationReader, GenAppConfigurationReader } from "../config-reader";
import { OverviewCapability } from "./overview-generator";

export interface Capability {
    identifier: string;
    configReader: ConfigurationReader<ApplicationConfiguration>;
    generateCapability(): void;
};

export function getCapabilityGenerators(): Capability[] {

    const configReader: ConfigurationReader<ApplicationConfiguration> = new GenAppConfigurationReader();

    return [
        new OverviewCapability(configReader),
        // ... other capabilities .. 
    ];
}
