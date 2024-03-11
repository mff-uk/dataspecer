import { DeepPartial } from "../core/utilities/deep-partial";

export const DefaultDataSpecificationConfiguration =  {
    /**
     * Base URL for the generated artefacts.
     */
    publicBaseUrl: null as string | null,

    /**
     * Simple configuration to set which artifacts should be included.
     */
    useGenerators: {} as Record<string, boolean>,

    /**
     * Whether instances of this class may/must/must not have identity, for example IRI.
     * If set to undefined, the default value will be used which is "ALWAYS" currently.
     */
    instancesHaveIdentity: "ALWAYS" as "ALWAYS" | "NEVER" | "OPTIONAL",

    /**
     * Require explicit instance typing. For example as @type property in JSON-LD.
     * If set to undefined, the default value will be used which is "ALWAYS" currently.
     */
    instancesSpecifyTypes: "ALWAYS" as "ALWAYS" | "NEVER" | "OPTIONAL",

    dataPsmIsClosed: "OPEN" as "OPEN" | "CLOSED",

    /**
     * Whether generators that are not specified are enabled by default.
     * Use false for instances where a specific set of generators is required.
     */
    generatorsEnabledByDefault: true,
}

export type DataSpecificationConfiguration = typeof DefaultDataSpecificationConfiguration;

export interface ConfigurationWithJson {
    [DataSpecificationConfigurator.KEY]?: DeepPartial<DataSpecificationConfiguration>;
}

export class DataSpecificationConfigurator {
    static KEY = "data-specification" as const;

    static getFromObject(configurationObject: object | null): DeepPartial<DataSpecificationConfiguration> {
        return configurationObject?.[DataSpecificationConfigurator.KEY] ?? {};
    }

    static setToObject(configurationObject: object, options: DeepPartial<DataSpecificationConfiguration>): ConfigurationWithJson {
        return {...configurationObject, [DataSpecificationConfigurator.KEY]: options};
    }

    static merge(...options: DeepPartial<DataSpecificationConfiguration>[]): DeepPartial<DataSpecificationConfiguration> {
        let result: DeepPartial<DataSpecificationConfiguration> = {};
        for (const option of options) {
            result = {...result, ...option, useGenerators: {...result.useGenerators, ...option.useGenerators}};
        }

        return result;
    }

    static getDefault() {
        return DefaultDataSpecificationConfiguration;
    }
}
