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

/**
 * Factory interface for creating data access layer generators based on the provided data source configuration.
 */
export type DataAccessLayerGeneratorFactory = {
    /**
     * Returns the data layer generator from the provided data source.
     *
     * @param technicalLabel - The technical name of the aggregate for which the data layer generator is requested.
     * @param specificationIri - The IRI identifier of the data specification for which the data layer is to be generated.
     * @param datasourceConfig - Configuration of the data source coming from the application graph based on which the data layer generator will be selected.
     * @returns Data layer generator instance that corresponds to the provided data source.
     */
    getDalGeneratorStrategy: (technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig) => DalGeneratorStrategy;
}


/**
 * Factory instance for instantiation of data access layer generators for list capability.
 * This factory provides a method to get the appropriate data access layer generator based
 * on the type of the data source specified in the application graph configuration.
 */
export const ListTemplateDalGeneratorFactory: DataAccessLayerGeneratorFactory = {

    /** @inheritdoc */
    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<ListTemplate>(
                new InstanceListLdkitReaderGenerator(`./readers/ldkit/${technicalLabel}-list.ts`),
                specificationIri,
                datasourceConfig
            ),
            [DataSourceType.JSON]:  null as unknown as DalGeneratorStrategy,
            [DataSourceType.XML]:   null as unknown as DalGeneratorStrategy,
            [DataSourceType.CSV]:   null as unknown as DalGeneratorStrategy,
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy,
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}

/**
 * Factory instance for instantiation of data access layer generators for detail capability.
 * This factory provides a method to get the appropriate data access layer generator based
 * on the type of the data source specified in the application graph configuration.
 */
export const DetailTemplateDalGeneratorFactory: DataAccessLayerGeneratorFactory = {

    /** @inheritdoc */
    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<DetailTemplate>(
                new InstanceDetailLdkitReaderGenerator(`./readers/ldkit/${technicalLabel}-detail.ts`),
                specificationIri,
                datasourceConfig
            ),
            [DataSourceType.JSON]:  null as unknown as DalGeneratorStrategy,
            [DataSourceType.XML]:   null as unknown as DalGeneratorStrategy,
            [DataSourceType.CSV]:   null as unknown as DalGeneratorStrategy,
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy,
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}

/**
 * Factory instance for instantiation of data access layer generators for deletion capability.
 * This factory provides a method to get the appropriate data access layer generator based
 * on the type of the data source specified in the application graph configuration.
 */
export const DeleteInstanceTemplateGeneratorFactory: DataAccessLayerGeneratorFactory = {

    /** @inheritdoc */
    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<DeleteTemplate>(
                new InstanceDeleteLdkitGenerator(`./writers/ldkit/${technicalLabel}-instance-delete.ts`),
                specificationIri,
                datasourceConfig
            ),
            [DataSourceType.JSON]:  null as unknown as DalGeneratorStrategy,
            [DataSourceType.XML]:   null as unknown as DalGeneratorStrategy,
            [DataSourceType.CSV]:   null as unknown as DalGeneratorStrategy,
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy,
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}

/**
 * Factory instance for instantiation of data access layer generators for creation capability.
 * This factory provides a method to get the appropriate data access layer generator based
 * on the type of the data source specified in the application graph configuration.
 */
export const CreateInstanceTemplateGeneratorFactory: DataAccessLayerGeneratorFactory = {

    /** @inheritdoc */
    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<CreateTemplate>(
                new CreateLdkitInstanceGenerator(`./writers/ldkit/${technicalLabel}-create-instance.ts`),
                specificationIri,
                datasourceConfig
            ),
            [DataSourceType.JSON]:  null as unknown as DalGeneratorStrategy,
            [DataSourceType.XML]:   null as unknown as DalGeneratorStrategy,
            [DataSourceType.CSV]:   null as unknown as DalGeneratorStrategy,
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy,
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}

/**
 * Factory instance for instantiation of data access layer generators for edit capability.
 * This factory provides a method to get the appropriate data access layer generator based
 * on the type of the data source specified in the application graph configuration.
 */
export const EditInstanceTemplateGeneratorFactory: DataAccessLayerGeneratorFactory = {

    /** @inheritdoc */
    getDalGeneratorStrategy(technicalLabel: string, specificationIri: string, datasourceConfig: DatasourceConfig): DalGeneratorStrategy {
        const generators = {
            [DataSourceType.RDF]: new TemplateDataLayerGeneratorStrategy<EditTemplate>(
                new EditLdkitInstanceGenerator(`./writers/ldkit/${technicalLabel}-edit-instance.ts`),
                specificationIri,
                datasourceConfig
            ),
            [DataSourceType.JSON]:  null as unknown as DalGeneratorStrategy,
            [DataSourceType.XML]:   null as unknown as DalGeneratorStrategy,
            [DataSourceType.CSV]:   null as unknown as DalGeneratorStrategy,
            [DataSourceType.Local]: null as unknown as DalGeneratorStrategy,
        };

        const generator = generators[datasourceConfig.format];

        if (!generator) {
            throw new Error("No matching data layer generator has been found!");
        }

        return generator;
    }
}