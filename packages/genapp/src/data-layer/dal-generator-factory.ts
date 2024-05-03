import axios, { AxiosResponse } from "axios";
import { DataSourceType, DatasourceConfig } from "../application-config";
import { CodeGenerationArtifactMetadata, GeneratorArtifactProvider } from "@dataspecer/genapp-artifact-provider";

export type DataAccessLayerGeneratorFactory = {
    getDalGenerator: (datasourceConfig: DatasourceConfig) => DalGenerator;
}

class Api {
    private readonly endpointBaseUri: string;

    constructor(baseUri: string) {
        this.endpointBaseUri = baseUri;
    }

    async generateDalLayerArtifact(dalGeneratorName: string, aggregateName: string): 
        Promise<AxiosResponse<string, any>> {

        const path = `/generators/${dalGeneratorName}/${aggregateName}`;
        const promise = axios.get(this.endpointBaseUri + path); //, 
        //     { 
        //         params: {
        //             "aggregateName": aggregateName
        //         }
        //     }
        // );

        return promise;
    }

}

export class DalGenerator {
    private readonly dalGeneratorName: any;

    constructor(dalGenerator: string) {
        this.dalGeneratorName = dalGenerator;
    }

    generate(aggregateName: string): Promise<AxiosResponse<string, any>> {

        let api = new Api("http://localhost:8888");
        
        console.log("       Calling the backend for DAL with: ", aggregateName);

        return api.generateDalLayerArtifact(this.dalGeneratorName, aggregateName);

        //let result = new CodeGenerationArtifactMetadata({ "anObjectName": "./anObjectPath.ts" });
        // setTimeout(() => {
        //     console.log("Waited");
        // }, 5000)

        //return result;
    }
}

export const DalGeneratorFactory: DataAccessLayerGeneratorFactory = {

    getDalGenerator(datasourceConfig: DatasourceConfig): DalGenerator {
        const generators = {
            [DataSourceType.Rdf]: new DalGenerator("ldkit"),
            [DataSourceType.Json]: new DalGenerator("json"),
            [DataSourceType.Xml]: new DalGenerator("xml"),
            [DataSourceType.Csv]: new DalGenerator("csv"),
            [DataSourceType.Local]: new DalGenerator("local")
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}