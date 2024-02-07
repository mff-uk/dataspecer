/**
 * Returns the relative path between files from {@param from} to {@param to}
 */
export function pathRelative(from: string, to: string): string {
    // Absolute filesystem paths or URLs with same domain
    if ((from.startsWith("/") && to.startsWith("/")) ||
        (from.match(/^https?:\/\//) && to.match(/^https?:\/\//) && from.split("/")[2] === to.split("/")[2])
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
            return (up ? "../".repeat(up) : "./") + toParts.slice(samePartsLength).join("/");
        } else {
            return "../".repeat(up) + ".";
        }

    }

    // fallback
    return to;
}
