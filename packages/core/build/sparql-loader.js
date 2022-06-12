// Converts .sparql files into .js files that can be imported

function processSparql(input) {
    return input;
}

module.exports = {
    process: content => ({
        code: `"use strict";\n` +
            `Object.defineProperty(exports, "__esModule", { value: true });\n` +
            `var a = ${JSON.stringify(processSparql(content))};\n` +
            `exports.default = a;\n`
    })
};
