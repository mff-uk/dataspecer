declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // URL of services/backend
            REACT_APP_BACKEND: string;

            // URL of applications/specification-manager
            REACT_APP_SCHEMA_GENERATOR: string;

            // Current version string that will be shown in footer
            // @optional
            // @example $BRANCH@$(echo $COMMIT_REF | head -c7) $(date -u +%F\ %H:%M:%S)
            REACT_APP_DEBUG_VERSION?: string;
        }
    }
}

export {}