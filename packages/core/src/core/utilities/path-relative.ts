/**
 * Returns the relative path between files from {@param from} to {@param to}.
 *
 * It also strips index.html, index.htm from the end of the path.
 *
 * @param useAbsoluteIfHttp If true and the path is a URL, it will return the absolute path, effectively ignoring the from parameter.
 */
export function pathRelative(from: string, to: string, useAbsoluteIfHttp: boolean = false): string {
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
    if (path.endsWith("/index.html")) {
        return path.slice(0, - ("/index.html".length) + 1);
    }
    if (path.endsWith("/index.htm")) {
        return path.slice(0, - ("/index.htm".length) + 1);
    }
    return path;
}