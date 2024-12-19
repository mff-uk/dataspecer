/**
 * This type is used together with the {@link ExplicitAnchors} type. What the values mean:
 * - "only-original-anchors" - The original anchors are kept, unless explicitly overriden by notAnchored property inside the {@link ExplicitAnchors}
 * - "merge-with-original-anchors" - Use the values in {@link ExplicitAnchors} and if some value is missing, use the original value in visual model.
 * - "only-given-anchors" - Only the values given in anchored are anchored.
 * - "anchor-everything-except-notAnchored" - Everything which is not part of the notAnchored property will be anchored
 */
type AnchorOverrideSetting = "only-original-anchors" | "merge-with-original-anchors" | "only-given-anchors" | "anchor-everything-except-notAnchored";

export type ExplicitAnchors = {
	/**
	 * The identifiers of nodes, which should not be anchored.
	 */
	notAnchored: string[],
	/**
	 * The identifiers of nodes, which should not be anchored. NOT Used only if {@link shouldAnchorEverythingExceptNotAnchored} is set to "only-original-anchors".
	 */
	anchored: string[],
    /**
     * For more info check {@link AnchorOverrideSetting}
     */
	shouldAnchorEverythingExceptNotAnchored: AnchorOverrideSetting,
};


/**
 *
 * @param identifier
 * @param explicitAnchors
 * @param defaultAnchorValue This value is relevant for the "merge-with-original-anchors" and "only-original-anchors" cases,
 * since if it isn't overriden using the {@link explicitAnchors} then we return the given default.
 * @returns
 */
export function isEntityWithIdentifierAnchored(identifier: string, explicitAnchors: ExplicitAnchors, defaultAnchorValue: boolean): boolean {
    let isAnchored: boolean = defaultAnchorValue;
    switch(explicitAnchors.shouldAnchorEverythingExceptNotAnchored) {
        case "merge-with-original-anchors":
            if(explicitAnchors.anchored.find(id => identifier === id)) {
                isAnchored = true;
            }
            else {
                if(explicitAnchors.notAnchored.find(id => identifier === id)) {
                    isAnchored = false;
                }
                // Else keep the old value
            }
            break;
        case "only-given-anchors":
            if(explicitAnchors.anchored.find(id => identifier=== id)) {
                isAnchored = true;
            }
            else {
                isAnchored = false;
            }
            break;
        case "only-original-anchors":
            if(explicitAnchors.notAnchored.find(id => identifier === id)) {
                isAnchored = false;
            }
            break;
        case "anchor-everything-except-notAnchored":
            if(explicitAnchors.notAnchored.find(id => identifier === id)) {
                isAnchored = false;
            }
            else {
                isAnchored = true;
            }
            break;
        default:
            throw new Error("Forgot to extend switch for Explicit Anchors");
    }

    return isAnchored;
}
