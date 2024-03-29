// @see {@link ../configuration/README.md}

import {DeepPartial} from "@dataspecer/core/core/utilities/deep-partial";

export const DefaultXmlConfiguration = {
    rootClass: {
        extractType: false,
        extractGroup: false,
    } as ExtractOptions,

    otherClasses: {
        extractType: false,
        extractGroup: false,
    } as ExtractOptions,

    /**
     * If set, the common xml schema will be referenced instead of bundled.
     */
    commonXmlSchemaExternalLocation: null as string | null,
};

/**
 * Type containing all options available for XML and XML related generators.
 */
export type XmlConfiguration = typeof DefaultXmlConfiguration;

/**
 * Options controlling the extraction of types and groups, i.e. whether to
 * define and use them via a name, or to use them inline when needed.
 */
export interface ExtractOptions {
    extractType: boolean;
    extractGroup: boolean;
}

export interface ConfigurationWithXml {
    [XmlConfigurator.KEY]?: DeepPartial<XmlConfiguration>;
}

export class XmlConfigurator {
    static KEY = "xml" as const;

    static getFromObject(configurationObject: object | null): DeepPartial<XmlConfiguration> {
        return configurationObject?.[XmlConfigurator.KEY] ?? {};
    }

    static setToObject(configurationObject: object, options: DeepPartial<XmlConfiguration>): ConfigurationWithXml {
        return {...configurationObject, [XmlConfigurator.KEY]: options};
    }

    static merge(...options: DeepPartial<XmlConfiguration>[]): DeepPartial<XmlConfiguration> {
        const result: DeepPartial<XmlConfiguration> = {};
        for (const option of options) {
            if (option.rootClass) {
                result.rootClass = {...result.rootClass, ...option.rootClass};
            }
            if (option.otherClasses) {
                result.otherClasses = {...result.otherClasses, ...option.otherClasses};
            }
            if (option.commonXmlSchemaExternalLocation !== undefined) {
                result.commonXmlSchemaExternalLocation = option.commonXmlSchemaExternalLocation;
            }
        }

        return result;
    }

    static getDefault() {
        return DefaultXmlConfiguration;
    }
}
