// @ts-ignore
import configuration from "../main.config";

export interface Configuration {
    // Server's public URL. Must not end with a slash
    host: string;

    // Local port to listen on
    port: number;

    // Max payload limit for stores PUSH operation
    payloadSizeLimit: string;

    // Root used for v1 dataspecer
    v1RootIri: string;
    v1RootMetadata: object;

    // Root used for local models
    localRootIri: string;
    localRootMetadata: object;

    // Generator configuraion
    configuration: object;
}

const defaultConfiguration = {
    payloadSizeLimit: "64mb",
    v1RootIri: "http://dataspecer.com/packages/v1",
    v1RootMetadata: {
        label: {
            cs: "Datové specifikace z core@v.1",
            en: "Data specifications from core@v.1"
        },
        description: {
            cs: "Tato složka obsahuje všechny datové specifikace se kterými dokáže pracovat manažer specifikací z core@v.1.",
            en: "This folder contains all data specifications that can be managed by the data specification manager from core@v.1."
        }
    },

    localRootIri: "http://dataspecer.com/packages/local-root",
    localRootMetadata: {
        label: {
            cs: "Lokální modely",
            en: "Local models"
        },
    },
} as Partial<Configuration>

const envConfiguration = {} as Partial<Configuration>;
if (process.env.HOST) {
    envConfiguration.host = process.env.HOST;
}
if (process.env.PORT) {
    envConfiguration.port = Number(process.env.PORT);
}

export default ({...defaultConfiguration, ...configuration, ...envConfiguration} as Configuration);
