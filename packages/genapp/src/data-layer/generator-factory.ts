import { DataSourceType, DatasourceConfig } from "../engine/graph/datasource";
import { DalGeneratorStrategy } from "./strategy-interface";
import { TemplateDataLayerGeneratorStrategy } from "./strategies/ldkit-template-strategy";
import { CreateLdkitInstanceGenerator, CreateLdkitInstanceTemplate } from "./template-generators/ldkit/create-instance-generator";
import { InstanceDeleteLdkitGenerator, InstanceDeleteLdkitTemplate } from "./template-generators/ldkit/instance-delete-generator";
import { InstanceDetailLdkitReaderGenerator, InstanceDetailLdkitReaderTemplate } from "./template-generators/ldkit/instance-detail-reader-generator";
import { InstanceListLdkitReaderGenerator, InstanceListLdkitReaderTemplate } from "./template-generators/ldkit/instance-list-reader-generator";
import { EditLdkitInstanceGenerator, EditLdkitInstanceTemplate } from "./template-generators/ldkit/edit-instance-generator";

export type DataAccessLayerGeneratorFactory = {
    getDalGeneratorStrategy: (technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig) => DalGeneratorStrategy;
}

export const ListTemplateDalGeneratorFactory: DataAccessLayerGeneratorFactory = {

    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<InstanceListLdkitReaderTemplate>(
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
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<InstanceDetailLdkitReaderTemplate>(
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
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<InstanceDeleteLdkitTemplate>(
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
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<CreateLdkitInstanceTemplate>(
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
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<EditLdkitInstanceTemplate>(
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