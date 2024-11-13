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

	shouldAnchorEverythingExceptNotAnchored: AnchorOverrideSetting,
};


/**
 * @returns Default value is false.
 */
export function isEntityWithIdentifierAnchored(identifier: string, explicitAnchors: ExplicitAnchors): boolean {
    let isAnchored = false;
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