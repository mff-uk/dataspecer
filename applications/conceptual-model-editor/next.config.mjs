/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,

    experimental: { appDir: true },

    // Export to static HTML files for hosting without a Node.js server
    output: "export",

    webpack: (config) => {
        config.experiments.topLevelAwait = true;
        return config;
    },

    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    
    // Ignore eslint and ts errors during build
    
    eslint: {
        ignoreDuringBuilds: true,
    },
    
    typescript: {
        ignoreBuildErrors: true,
    }
};
export default config;
