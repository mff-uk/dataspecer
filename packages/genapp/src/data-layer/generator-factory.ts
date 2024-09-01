import { DataSourceType, DatasourceConfig } from "../engine/graph/datasource";
import { DalGeneratorStrategy } from "./strategy-interface";
import { FileDalGeneratorStrategy } from "./strategies/file-dal-strategy";
import { LdkitListDalGenerator } from "./strategies/ldkit/list-strategy";
import { LocalStorageDalGeneratorStrategy } from "./strategies/localstorage-dal-strategy";
import { LdkitDetailDalGenerator } from "./strategies/ldkit/detail-strategy";
import { LdkitDeleteDalGenerator } from "./strategies/ldkit/delete-strategy";
import { CreateLdkitInstanceDalStrategy } from "./strategies/ldkit/create-strategy";

export type DataAccessLayerGeneratorFactory = {
    getDalGeneratorStrategy: (datasourceConfig: DatasourceConfig) => DalGeneratorStrategy;
}

export const ListTemplateDalGeneratorFactory: DataAccessLayerGeneratorFactory = {

    getDalGeneratorStrategy(datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.Rdf]: new LdkitListDalGenerator(datasourceConfig),
            [DataSourceType.Json]:  null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("json"),
            [DataSourceType.Xml]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("xml"),
            [DataSourceType.Csv]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("csv"),
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy, //new LocalStorageDalGeneratorStrategy()
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}

export const DetailTemplateDalGeneratorFactory: DataAccessLayerGeneratorFactory = {

    getDalGeneratorStrategy(datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.Rdf]: new LdkitDetailDalGenerator(datasourceConfig),
            [DataSourceType.Json]:  null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("json"),
            [DataSourceType.Xml]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("xml"),
            [DataSourceType.Csv]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("csv"),
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy, //new LocalStorageDalGeneratorStrategy()
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}

export const DeleteInstanceTemplateGeneratorFactory: DataAccessLayerGeneratorFactory = {
    getDalGeneratorStrategy(datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.Rdf]: new LdkitDeleteDalGenerator(datasourceConfig),
            [DataSourceType.Json]:  null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("json"),
            [DataSourceType.Xml]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("xml"),
            [DataSourceType.Csv]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("csv"),
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy, //new LocalStorageDalGeneratorStrategy()
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}

export const CreateInstanceTemplateGeneratorFactory: DataAccessLayerGeneratorFactory = {
    getDalGeneratorStrategy(datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.Rdf]: new CreateLdkitInstanceDalStrategy(datasourceConfig),
            [DataSourceType.Json]:  null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("json"),
            [DataSourceType.Xml]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("xml"),
            [DataSourceType.Csv]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("csv"),
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy, //new LocalStorageDalGeneratorStrategy()
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}