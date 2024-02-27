import { ConfigurationReader, ApplicationConfiguration } from "../config-reader";
import { Capability } from "./capability-definition";

export class OverviewCapability implements Capability {
    identifier: string = "";
    configReader: ConfigurationReader<ApplicationConfiguration>;

    constructor(configReader: ConfigurationReader<ApplicationConfiguration>) {
        this.configReader = configReader;
    }
    
    generateCapability(): void {
        throw new Error("Method not implemented.");
    }
}