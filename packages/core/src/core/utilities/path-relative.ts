/**
 * Returns the relative path between files from {@param from} to {@param to}
 */
export function pathRelative(from: string, to: string): string {
    // Absolute filesystem paths
    if (from.startsWith("/") && to.startsWith("/")) {
        const fromParts = from.split("/");
        const toParts = to.split("/");

        const length = Math.min(fromParts.length, toParts.length);
        let samePartsLength = 0;
        while (samePartsLength < length && fromParts[samePartsLength] === toParts[samePartsLength]) {
            samePartsLength++;
        }
        // samePartsLength > 0

        const up = Math.max(fromParts.length - samePartsLength - 1, 0); // for filename
        const path = "../".repeat(up) + toParts.slice(samePartsLength).join("/");

        return path.length > 0 ? path : ".";
    }

    // fallback
    return to;
}
