// @see {@link ../configuration/README.md}

import {DeepPartial} from "@dataspecer/core/core/utilities/deep-partial";

export const DefaultBikeshedConfiguration =  {
    /**
     * Markdown content of abstract
     */
    abstract: "This document was generated automatically by [Dataspecer](https://dataspecer.com/)." as string | null,

    /**
     * Markdown content for editors
     */
    editor: "Dataspecer editor, https://dataspecer.com/" as string | null,

    /**
     * Bikeshed metadata
     */
    otherMetadata: {Logo: "https://ofn.gov.cz/static/images/logo.png"} as Record<string, string>,

    /**
     * Language of the document
     */
    language: "cs" as "en" | "cs",

    /**
     * Whether the documentation of the structural model shall use technical labels, or human-readable labels.
     */
    useTechnicalLabelsInStructuralModels: true as boolean,
}

export type BikeshedConfiguration = typeof DefaultBikeshedConfiguration;

export interface ConfigurationWithBikeshed {
    [BikeshedConfigurator.KEY]?: DeepPartial<BikeshedConfiguration>;
}

export class BikeshedConfigurator {
    static KEY = "bikeshed" as const;

    static getFromObject(configurationObject: object | null): DeepPartial<BikeshedConfiguration> {
        return configurationObject?.[BikeshedConfigurator.KEY] ?? {};
    }

    static setToObject(configurationObject: object, options: DeepPartial<BikeshedConfiguration>): ConfigurationWithBikeshed {
        return {...configurationObject, [BikeshedConfigurator.KEY]: options};
    }

    static merge(...options: DeepPartial<BikeshedConfiguration>[]): DeepPartial<BikeshedConfiguration> {
        let result: DeepPartial<BikeshedConfiguration> = {};
        for (const option of options) {
            result = {...result, ...option};
        }

        return result;
    }

    static getDefault() {
        return DefaultBikeshedConfiguration;
    }
}
