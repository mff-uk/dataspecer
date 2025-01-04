export interface GenappEnvironmentConfig {
    backendHost: string;
    tmpOutZipname: string;
    tmpOutDir: string;
}

/**
 * Singleton class to handle the configuration for the application generator.
 */
export class GenappEnvConfig {
    private static _instance: GenappEnvConfig;
    private readonly _envConfig: GenappEnvironmentConfig;

    private constructor(envConfig: GenappEnvironmentConfig) {
        this._envConfig = envConfig;
    }

    /**
     * Instance retrieval method to get the GenappEnvConfig class instance.
     * If the instance does not exist, it creates one using the provided environment configuration based on singleton pattern.
     * @param envConfig - Configuration object.
     * @returns The singleton instance of GenappEnvConfig.
     */
    public static getInstance(envConfig: GenappEnvironmentConfig): GenappEnvConfig {
        if (!this._instance) {
            this._instance = new this(envConfig);
        }

        return this._instance;
    }

    /**
     * Gets the backend host from the environment configuration.
     * @returns The backend host URL.
     */
    public static get Host() {
        return this._instance._envConfig.backendHost;
    }

    /**
     * Gets the temporary output directory from the environment configuration.
     * @returns The path to the temporary output directory.
     */
    public static get TmpOutDir() {
        return this._instance._envConfig.tmpOutDir;
    }

    /**
     * Gets the temporary output zip file name from the environment configuration.
     * @returns The name of the temporary output zip file.
     */
    public static get TmpOutZipName() {
        return this._instance._envConfig.tmpOutZipname;
    }
}
