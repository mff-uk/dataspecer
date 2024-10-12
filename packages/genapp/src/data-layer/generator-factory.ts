import {
    CreateTemplate,
    DeleteTemplate,
    DetailTemplate,
    EditTemplate,
    ListTemplate,
    CreateLdkitInstanceGenerator,
    EditLdkitInstanceGenerator,
    InstanceDeleteLdkitGenerator,
    InstanceDetailLdkitReaderGenerator,
    InstanceListLdkitReaderGenerator
}
from "./template-generators/ldkit";
import { DalGeneratorStrategy } from "./strategy-interface";
import { DataSourceType, DatasourceConfig } from "../engine/graph/datasource";
import { TemplateDataLayerGeneratorStrategy } from "./strategies/ldkit-template-strategy";

export type DataAccessLayerGeneratorFactory = {
    getDalGeneratorStrategy: (technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig) => DalGeneratorStrategy;
}

export const ListTemplateDalGeneratorFactory: DataAccessLayerGeneratorFactory = {

    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<ListTemplate>(
                new InstanceListLdkitReaderGenerator(`./readers/ldkit/${technicalLabel}-list.ts`),
                specificationIri,
                datasourceConfig
            ),
            [DataSourceType.JSON]:  null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("json"),
            [DataSourceType.XML]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("xml"),
            [DataSourceType.CSV]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("csv"),
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

    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<DetailTemplate>(
                new InstanceDetailLdkitReaderGenerator(`./readers/ldkit/${technicalLabel}-detail.ts`),
                specificationIri,
                datasourceConfig
            ),
            [DataSourceType.JSON]:  null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("json"),
            [DataSourceType.XML]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("xml"),
            [DataSourceType.CSV]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("csv"),
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
    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<DeleteTemplate>(
                new InstanceDeleteLdkitGenerator(`./writers/ldkit/${technicalLabel}-instance-delete.ts`),
                specificationIri,
                datasourceConfig
            ),
            [DataSourceType.JSON]:  null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("json"),
            [DataSourceType.XML]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("xml"),
            [DataSourceType.CSV]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("csv"),
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
    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<CreateTemplate>(
                new CreateLdkitInstanceGenerator(`./writers/ldkit/${technicalLabel}-create-instance.ts`),
                specificationIri,
                datasourceConfig
            ),
            [DataSourceType.JSON]:  null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("json"),
            [DataSourceType.XML]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("xml"),
            [DataSourceType.CSV]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("csv"),
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy, //new LocalStorageDalGeneratorStrategy()
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}

export const EditInstanceTemplateGeneratorFactory: DataAccessLayerGeneratorFactory = {
    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<EditTemplate>(
                new EditLdkitInstanceGenerator(`./writers/ldkit/${technicalLabel}-edit-instance.ts`),
                specificationIri,
                datasourceConfig
            ),
            [DataSourceType.JSON]:  null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("json"),
            [DataSourceType.XML]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("xml"),
            [DataSourceType.CSV]:   null as unknown as DalGeneratorStrategy, //new FileDalGeneratorStrategy("csv"),
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy, //new LocalStorageDalGeneratorStrategy()
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}