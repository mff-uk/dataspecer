declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Server's public URL. Must not end with a slash.
            HOST: string;

            // Local port to listen on.
            PORT: string;

            // Max payload limit for stores PUSH operation
            PAYLOAD_SIZE_LIMIT: string;
        }
    }
}

export {}
