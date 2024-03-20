import { DatasourceConfig } from "../application-config";
import { DalGeneratorFactory } from "../data-layer/dal-generator-factory";
import { Capability } from "./capability-definition";

export class OverviewCapability implements Capability {
    identifier: string = "";
    //configReader: ConfigurationReader<ApplicationConfiguration>;
    dalGenerator: any;

    constructor(datasourceConfig: DatasourceConfig) {
        this.dalGenerator = DalGeneratorFactory.getDalGenerator(datasourceConfig)
    }
    
    generateCapability(): void {
        throw new Error("Method not implemented.");
    }
}