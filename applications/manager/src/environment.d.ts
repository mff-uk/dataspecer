declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // URL of services/backend
            REACT_APP_BACKEND: string;

            // Basename URL
            // To change the basename, change also "homepage" attribute in package.json
            REACT_APP_BASENAME: string;

            // URL of applications/editor
            REACT_APP_EDITOR: string;

            // Current version string that will be shown in footer
            // @optional
            // @example $BRANCH@$(echo $COMMIT_REF | head -c7) $(date -u +%F\ %H:%M:%S)
            REACT_APP_DEBUG_VERSION?: string;
        }
    }
}

export {}
