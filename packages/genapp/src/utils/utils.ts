import path from "path";

export function getRelativePath(sourcePath: string, targetPath: string): string {
    // removes file extension

    const prefix = path.dirname(targetPath).startsWith(path.dirname(sourcePath)) ? "./" : "";
    console.log(`--utils source: "${sourcePath}"`);
    console.log(`--utils Target: "${targetPath}"`);

    const relPath = prefix + path.posix.relative(path.dirname(sourcePath), targetPath);
    console.log(`actual relative: "${relPath}`);
    return relPath;
}

export function normalizeName(name: string, replaceWith: string = "-") {
    return name
        .replace(/[\s/<>:"\\|?*]+/g, replaceWith) // Windows and Linux forbidden characters
        .toLowerCase();
}