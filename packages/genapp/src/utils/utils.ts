import path from "path";

export function getRelativePath(sourcePath: string, targetPath: string): string {
    // removes file extension
    console.log(`--utils source: "${sourcePath}"`);
    console.log(`--utils Target: "${targetPath}"`);

    targetPath = targetPath.substring(0, targetPath.lastIndexOf(".") < 1 ? targetPath.length : targetPath.lastIndexOf("."));
    //console.log(`--after Target: "${targetPath}"`);

    const prefix = path.dirname(targetPath).startsWith(path.dirname(sourcePath)) ? "./" : "";

    //console.log(`--utils prefix: ${prefix}`);
    //console.log(`relative: "${prefix + path.posix.relative(sourcePath, targetPath)}"`);

    const result = prefix + path.posix.relative(path.dirname(sourcePath), targetPath);
    //console.log(`actual relative: "${result}`);
    return result;
}

export function toPascalCase(str: string): string {
    return str.replace(
        /(\w)(\w*)/g,
        (_, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
    );
}