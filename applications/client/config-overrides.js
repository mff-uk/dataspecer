// Some parts of @dataspecer/core library contains nodejs specific code, hence
// the polyfills are required.

module.exports = function override(config, env) {
    config.resolve.fallback = {
        buffer: false,
    };
    return config;
};
