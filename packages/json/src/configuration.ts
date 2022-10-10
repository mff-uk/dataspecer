// @see {@link ../configuration/README.md}

import {DeepPartial} from "@dataspecer/core/core/utilities/deep-partial";

export const DefaultJsonConfiguration =  {
    /**
     * Key of property representing ID of the entity.
     * If set to null, the property won't be used.
     */
    jsonIdKeyAlias: "id" as string | null,

    /**
     * Key of property representing the type of the entity.
     * If set to null, the property won't be used.
     */
    jsonTypeKeyAlias: "type" as string | null,

    /**
     * In JSON-LD, you can map types to any string. This decides what it shall be.
     */
    jsonTypeKeyMappingType: "json_type_key_mapping_type_label" as "json_type_key_mapping_type_label" | never,

    /**
     * Language used for label if {jsonTypeKeyMappingType === "json_type_key_mapping_type_label"}
     */
    jsonTypeKeyMappingTypeLabel: "cs" as string,
}

export type JsonConfiguration = typeof DefaultJsonConfiguration;

export interface ConfigurationWithJson {
    [JsonConfigurator.KEY]?: DeepPartial<JsonConfiguration>;
}

export class JsonConfigurator {
    static KEY = "json" as const;

    static getFromObject(configurationObject: object | null): DeepPartial<JsonConfiguration> {
        return configurationObject?.[JsonConfigurator.KEY] ?? {};
    }

    static setToObject(configurationObject: object, options: DeepPartial<JsonConfiguration>): ConfigurationWithJson {
        return {...configurationObject, [JsonConfigurator.KEY]: options};
    }

    static merge(...options: DeepPartial<JsonConfiguration>[]): DeepPartial<JsonConfiguration> {
        let result: DeepPartial<JsonConfiguration> = {};
        for (const option of options) {
            result = {...result, ...option};
        }

        return result;
    }

    static getDefault() {
        return DefaultJsonConfiguration;
    }
}
