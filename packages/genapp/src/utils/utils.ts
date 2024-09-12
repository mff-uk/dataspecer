import path from "path";

export function getRelativePath(sourcePath: string, targetPath: string): string {
    // removes file extension
    // console.log(`--utils source: "${sourcePath}"`);
    // console.log(`--utils Target: "${targetPath}"`);

    //targetPath = targetPath.substring(0, targetPath.lastIndexOf(".") < 1 ? targetPath.length : targetPath.lastIndexOf("."));
    //console.log(`--after Target: "${targetPath}"`);

    const prefix = path.dirname(targetPath).startsWith(path.dirname(sourcePath)) ? "./" : "";
    console.log(`--utils source: "${sourcePath}"`);
    console.log(`--utils Target: "${targetPath}"`);

    //console.log(`--utils prefix: ${prefix}`);
    //console.log(`relative: "${prefix + path.posix.relative(sourcePath, targetPath)}"`);

    const result = prefix + path.posix.relative(path.dirname(sourcePath), targetPath);
    console.log(`actual relative: "${result}`);
    return result;
}

export function normalizeName(name: string, replaceWith: string = "-") {
    return name
        .replace(/[\s/<>:"\\|?*]+/g, replaceWith) // Windows and Linux forbidden characters
        .toLowerCase();
}