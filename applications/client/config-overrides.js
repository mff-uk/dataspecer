// Some parts of @dataspecer/core library contains nodejs specific code, hence
// the polyfills are required.

const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

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
    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));
    return config;
};
