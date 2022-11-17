import {DeepPartial} from "@dataspecer/core/core/utilities/deep-partial";

export const DefaultCsvConfiguration =  {
    enableMultipleTableSchema: false,
}

export type CsvConfiguration = typeof DefaultCsvConfiguration;

export interface ConfigurationWithCsv {
    [CsvConfigurator.KEY]?: DeepPartial<CsvConfiguration>;
}

export class CsvConfigurator {
    static KEY = "csv" as const;

    static getFromObject(configurationObject: object | null): DeepPartial<CsvConfiguration> {
        return configurationObject?.[CsvConfigurator.KEY] ?? {};
    }

    static setToObject(configurationObject: object, options: DeepPartial<CsvConfiguration>): ConfigurationWithCsv {
        return {...configurationObject, [CsvConfigurator.KEY]: options};
    }

    static merge(...options: DeepPartial<CsvConfiguration>[]): DeepPartial<CsvConfiguration> {
        let result: DeepPartial<CsvConfiguration> = {};
        for (const option of options) {
            result = {...result, ...option};
        }

        return result;
    }

    static getDefault() {
        return DefaultCsvConfiguration;
    }
}
