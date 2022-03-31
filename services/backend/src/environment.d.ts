declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Public URL of the server
            HOST: string;

            PORT: string;

            // Max payload limit for stores PUSH operation
            PAYLOAD_SIZE_LIMIT: string;
        }
    }
}

export {}
