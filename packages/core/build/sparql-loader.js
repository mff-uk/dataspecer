// Converts .sparql files into .js files that can be imported

function processSparql(input) {
    const minified = input.replace(/^\s*#.*$/gm, "").replace(/\s+/g, " ");
    const parts = minified
        .split(/%[A-Z_]+%/)
        .map(part => JSON.stringify(part));
    const variables = [...minified
        .matchAll(/%([A-Z_]+)%/g)]
        .map(([,variable]) =>
            variable
                .toLowerCase()
                .replace(/_+(.)/g, (_, chr) => chr.toUpperCase())
        ).map(key => `p.${key}`);

    // zip the arrays
    const zipped = parts.flatMap((part, i) => [part, variables[i] ?? ""]);

    return zipped.filter(p => p.length > 0).join(" +\n\t");
}

module.exports = {
    process: content => ({
        code: `"use strict";\n` +
            `Object.defineProperty(exports, "__esModule", { value: true });\n` +
            `var a = p => ${processSparql(content)};\n` +
            `exports.default = a;\n`
    })
};
