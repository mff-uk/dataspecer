import {DeepPartial} from "@dataspecer/core/core/utilities/deep-partial";
import { CASINGS } from "./editor/operations/context/operation-context";

export const DefaultClientConfiguration =  {
    technicalLabelCasingConvention: "snake_case" as typeof CASINGS[number],

    technicalLabelSpecialCharacters: "allow" as "allow" | "remove-diacritics" | "remove-all",

    technicalLabelLanguages: "cs",
}

export type ClientConfiguration = typeof DefaultClientConfiguration;

export interface ConfigurationWithJson {
    [ClientConfigurator.KEY]?: DeepPartial<ClientConfiguration>;
}

export class ClientConfigurator {
    static KEY = "client" as const;

    static getFromObject(configurationObject: object | null): DeepPartial<ClientConfiguration> {
        return configurationObject?.[ClientConfigurator.KEY] ?? {};
    }

    static setToObject(configurationObject: object, options: DeepPartial<ClientConfiguration>): ConfigurationWithJson {
        return {...configurationObject, [ClientConfigurator.KEY]: options};
    }

    static merge(...options: DeepPartial<ClientConfiguration>[]): DeepPartial<ClientConfiguration> {
        let result: DeepPartial<ClientConfiguration> = {};
        for (const option of options) {
            result = {...result, ...option};
        }

        return result;
    }

    static getDefault() {
        return DefaultClientConfiguration;
    }
}
