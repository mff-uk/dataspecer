/**
 * Returns the relative path between files from {@param from} to {@param to}.
 *
 * It also strips index.html, index.htm from the end of the path.
 *
 * @param useAbsoluteIfHttp If true and the path is a URL, it will return the
 * absolute path, effectively ignoring the from parameter.
 *
 * @todo This function has too many responsibilities as, for example, the
 * index.html stripping may or may not be desired; useAbsoluteIfHttp is also not
 * suitable as sometimes, we may want relative paths only for sub-directories
 * but not for parent directories.
 */
export function pathRelative(from: string, to: string, useAbsoluteIfHttp: boolean = false): string {
    // First rule is to handle identical paths
    if (from === to) {
        return "";
        // Empty string is valid in <a href=""> tag and is preferred over "#".
    }
    // Absolute filesystem paths or URLs with same domain
    if ((from.startsWith("/") && to.startsWith("/")) ||
        (from.match(/^https?:\/\//) && to.match(/^https?:\/\//) && from.split("/")[2] === to.split("/")[2] && !useAbsoluteIfHttp)
    ) {
        const fromParts = from.split("/");
        const toParts = to.split("/");

        const length = Math.min(fromParts.length, toParts.length);
        let samePartsLength = 0;
        while (samePartsLength < length && fromParts[samePartsLength] === toParts[samePartsLength]) {
            samePartsLength++;
        }
        // samePartsLength > 0

        // samePartsLength is only applicable for directories
        if (samePartsLength > 0 && (fromParts.length === samePartsLength || toParts.length === samePartsLength)) {
            samePartsLength--;
        }

        const up = Math.max(fromParts.length - samePartsLength - 1, 0); // for filename
        if (toParts.slice(samePartsLength).length) {
            return stripIndex((up ? "../".repeat(up) : "./") + toParts.slice(samePartsLength).join("/"));
        } else {
            return stripIndex("../".repeat(up) + ".");
        }

    }

    // fallback
    return stripIndex(to);
}


function stripIndex(path: string): string {
    // todo, some web servers may not support stripping index.html
    return path;
    if (path.endsWith("/index.html")) {
        return path.slice(0, - ("/index.html".length) + 1);
    }
    if (path.endsWith("/index.htm")) {
        return path.slice(0, - ("/index.htm".length) + 1);
    }
    return path;
}