// @ts-ignore
import configuration from "../main.config";

export interface Configuration {
    // Server's public URL. Must not end with a slash
    host: string;

    // Local port to listen on
    port: number;

    // Max payload limit for stores PUSH operation
    payloadSizeLimit: string;

    // Generator configuraion
    configuration: object;
}

const defaultConfiguration = {
    payloadSizeLimit: "64mb",
} as Partial<Configuration>

export default ({...defaultConfiguration, ...configuration} as Configuration);
