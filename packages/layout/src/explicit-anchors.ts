/**
 * This type is used together with the {@link ExplicitAnchors} type. What the values mean:
 * - OnlyOriginalAnchors - The original anchors are kept, unless explicitly overriden by notAnchored property inside the {@link ExplicitAnchors}
 * - MergeWithOriginalAnchors - Use the values in {@link ExplicitAnchors} and if some value is missing, use the original value in visual model.
 * - OnlyGivenAnchors - Only the values given in anchored are anchored.
 * - AnchorEverythingExceptNotAnchored - Everything which is not part of the notAnchored property will be anchored
 */
export enum AnchorOverrideSetting {
    OnlyOriginalAnchors,
    MergeWithOriginalAnchors,
    OnlyGivenAnchors,
    AnchorEverythingExceptNotAnchored
};

/**
 * Represents explicits anchors which override the anchors from visual model.
 * It is important to note that the identifiers are both visual and semantic.
 * The mixing of identifier types does not matter, since the code handles it very naturally.
 */
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
        case AnchorOverrideSetting.MergeWithOriginalAnchors:
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
        case AnchorOverrideSetting.OnlyGivenAnchors:
            if(explicitAnchors.anchored.find(id => identifier=== id)) {
                isAnchored = true;
            }
            else {
                isAnchored = false;
            }
            break;
        case AnchorOverrideSetting.OnlyOriginalAnchors:
            if(explicitAnchors.notAnchored.find(id => identifier === id)) {
                isAnchored = false;
            }
            break;
        case AnchorOverrideSetting.AnchorEverythingExceptNotAnchored:
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
