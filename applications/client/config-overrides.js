// Some parts of @dataspecer/core library contains nodejs specific code, hence
// the polyfills are required.

module.exports = function override(config, env) {
    config.resolve.fallback = {
        buffer: false,
        "stream": false,
    };
    config.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
            return (
                warning.module &&
                warning.module.resource.includes("node_modules") &&
                warning.details &&
                warning.details.includes("source-map-loader")
            );
        },
    ];
    // Issue with LdKit generator, specifically with the @ts-morph package
    // https://github.com/microsoft/TypeScript/issues/39436
    config.module.noParse = /typescript\.js/;
    return config;
};
