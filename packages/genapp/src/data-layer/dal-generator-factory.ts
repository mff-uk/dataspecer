import { LDkitGenerator } from "@dataspecer/ldkit";
import { DatasourceConfig } from "../application-config";

export type DataAccessLayerGeneratorFactory = {
    getDalGenerator: (datasourceConfig: DatasourceConfig) => any;
}

export const DalGeneratorFactory: DataAccessLayerGeneratorFactory = {

    getDalGenerator(datasourceConfig: DatasourceConfig): any {
        const generators = {
            "rdf": new LDkitGenerator(),
            "json": null,
            "xml": null,
            "csv": null,
            "local": null
        };

        const generator = generators[datasourceConfig.format]
        
        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}