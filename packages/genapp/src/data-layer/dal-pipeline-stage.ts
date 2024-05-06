import { ArtifactSaver, GeneratorStage, type FirstStageGenerationContext } from "../engine/generator-stage-interface";
import { LayerArtifact } from "../engine/layer-artifact";
import { DalGeneratorStrategy, isLayerArtifact } from "./dal-generator-strategy-interface";
import { LDKitDalGenerator } from "./strategies/ldkit-strategy";

import { DataSourceType, DatasourceConfig } from "../application-config";
import { FileDalGeneratorStrategy } from "./strategies/file-dal-strategy";
import { LocalStorageDalGeneratorStrategy } from "./strategies/localstorage-dal-strategy";

export type DataAccessLayerGeneratorFactory = {
    getDalGeneratorStrategy: (datasourceConfig: DatasourceConfig) => DalGeneratorStrategy;
}

export class DataLayerGeneratorStage implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private readonly _dalGeneratorStrategy: DalGeneratorStrategy;
    private readonly dalGeneratorFactory: DataAccessLayerGeneratorFactory = {

        getDalGeneratorStrategy(datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
            const generators = {
                [DataSourceType.Rdf]: new LDKitDalGenerator(),
                [DataSourceType.Json]: new FileDalGeneratorStrategy("json"),
                [DataSourceType.Xml]: new FileDalGeneratorStrategy("xml"),
                [DataSourceType.Csv]: new FileDalGeneratorStrategy("csv"),
                [DataSourceType.Local]: new LocalStorageDalGeneratorStrategy()
            };
    
            const generator = generators[datasourceConfig.format];
    
            if (!generator) {
                throw new Error("No matching data layer generator has been found!");
            }
    
            return generator;
        }
    }

    constructor(datasourceConfig: DatasourceConfig, dalGeneratorFactory?: DataAccessLayerGeneratorFactory) {
        if (dalGeneratorFactory) {
            this.dalGeneratorFactory = dalGeneratorFactory;
        }

        this._dalGeneratorStrategy = this.dalGeneratorFactory.getDalGeneratorStrategy(datasourceConfig);
        this.artifactSaver = new ArtifactSaver("/data-layer/");
    }

    async generateStage(context: FirstStageGenerationContext): Promise<LayerArtifact> {
        const dalArtifact = await this._dalGeneratorStrategy.generateDataLayer(context);

        if (!isLayerArtifact(dalArtifact)) {
            console.log("is LayerArtifact from DataLayerGeneratorStage: ");
            console.log(dalArtifact);

            return dalArtifact;
        }

        console.log("Is axiosResponse from DataLayerGeneratorStage");
        console.log(dalArtifact.data);

        return dalArtifact.data as LayerArtifact;

        // let result: LayerArtifact;

        // dalArtifact
        //     .then(response => {
        //         const artifact = response.data;
        //         console.log(artifact);
        //         console.log("Type of response: ", typeof artifact);
        //         result = artifact;

        //         return artifact;

        //     })
        //     .catch(err => {
        //         const template: LayerArtifact = {
        //             fileName: "error-dal-layer.ts",
        //             exportedObjectName: "ErrorDalLayer",
        //             sourceText: `
        //             export const ErrorDalLayer = {}
        //             `
        //         };
        //         console.error(err.toJSON());
                
        //         result = template;
        //         return template;
        //     })
    }
}