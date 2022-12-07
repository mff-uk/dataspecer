const { join, dirname } = require('path');
const { existsSync, readdirSync, lstatSync, readFileSync, writeFileSync, mkdirSync } = require('fs');
const { process } = require('./sparql-loader');

const found = [];

function fromDir(startPath, filter, found) {
    if (!existsSync(startPath)) {
        return;
    }

    var files = readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = join(startPath, files[i]);
        var stat = lstatSync(filename);
        if (stat.isDirectory()) {
            fromDir(filename, filter, found); //recurse
        } else if (filename.endsWith(filter)) {
            found.push(filename);
        };
    };
};

fromDir('./src', '.sparql', found);

for (const file of found) {
    const rawData = readFileSync(file);
    const transformed = process(rawData.toString()).code;
    const newFile = 'lib' + file.substring('src'.length) + '.js';
    mkdirSync(dirname(newFile), {recursive: true});
    writeFileSync(newFile, transformed);
}
