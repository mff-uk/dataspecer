import { LDkitGenerator } from "@dataspecer/ldkit";
import { DataSourceType, DatasourceConfig } from "../application-config";
import { CodeGenerationArtifactMetadata, GeneratorArtifactProvider } from "@dataspecer/genapp-artifact-provider";

export type DataAccessLayerGeneratorFactory = {
    getDalGenerator: (datasourceConfig: DatasourceConfig) => DalGenerator;
}

export class DalGenerator {
    private readonly dalGenerator: GeneratorArtifactProvider;

    constructor(dalGenerator: GeneratorArtifactProvider | null) {
        if (dalGenerator === null) {
            throw new Error("Unsupported dalGenerator");
        }

        this.dalGenerator = dalGenerator;
    }

    generate(): CodeGenerationArtifactMetadata {
        return this.dalGenerator.getGeneratedArtifactMapping();
    }
}

export const DalGeneratorFactory: DataAccessLayerGeneratorFactory = {

    getDalGenerator(datasourceConfig: DatasourceConfig): DalGenerator {
        const generators = {
            [DataSourceType.Rdf]: new DalGenerator(new LDkitGenerator()),
            [DataSourceType.Json]: new DalGenerator(null),
            [DataSourceType.Xml]: new DalGenerator(null),
            [DataSourceType.Csv]: new DalGenerator(null),
            [DataSourceType.Local]: new DalGenerator(null)
        };

        const generator = generators[datasourceConfig.format];
        
        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}