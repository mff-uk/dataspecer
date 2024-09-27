/**
 * Type representing all the possible extensions of the selection.
 */
export type ExtensionType = "ASSOCIATION" | "ASSOCIATION-SOURCE" | "ASSOCIATION-TARGET" |
                                "GENERALIZATION" | "GENERALIZATION-PARENT" | "GENERALIZATION-CHILD" |
                                "PROFILE-EDGE" | "PROFILE-EDGE-SOURCE" | "PROFILE-EDGE-TARGET" |
                                "PROFILE-CLASS" | "PROFILE-CLASS-PARENT" | "PROFILE-CLASS-CHILD";

/**
 * Type representing additional visibility filter on the result
 */
export type VisibilityFilter = "ONLY-VISIBLE" | "ONLY-NON-VISIBLE" | "ALL";

// TODO: Missing some needed context in arguments
export const extendSelection = async (selection: string[], extensionTypes: ExtensionType[], visible: VisibilityFilter,
                             semanticModelFilter: Record<string, boolean> | null): Promise<string[]> => {
        const relevantExternalModels = getRelevantExternalModelsForExtension(semanticModelFilter);
        const extension: string[] = [];
        for(const extensionType of extensionTypes) {
            switch(extensionType) {
                case "ASSOCIATION":
                    await extendThroughAssociationSources(selection, visible, extension, relevantExternalModels);
                    await extendThroughAssociationTargets(selection, visible, extension, relevantExternalModels);
                    break;
                case "ASSOCIATION-TARGET":
                    await extendThroughAssociationTargets(selection, visible, extension, relevantExternalModels);
                    break;
                case "ASSOCIATION-SOURCE":
                    await extendThroughAssociationSources(selection, visible, extension, relevantExternalModels);
                    break;
                case "PROFILE-EDGE":
                    await extendThroughProfileEdgeSources(selection, visible, extension, relevantExternalModels);
                    await extendThroughProfileEdgeTargets(selection, visible, extension, relevantExternalModels);
                    break;
                case "PROFILE-EDGE-SOURCE":
                    await extendThroughProfileEdgeSources(selection, visible, extension, relevantExternalModels);
                    break;
                case "PROFILE-EDGE-TARGET":
                    await extendThroughProfileEdgeTargets(selection, visible, extension, relevantExternalModels);
                    break;
                case "GENERALIZATION":
                    await extendThroughGeneralizationParents(selection, visible, extension, relevantExternalModels);
                    await extendThroughGeneralizationChildren(selection, visible, extension, relevantExternalModels);
                    break;
                case "GENERALIZATION-CHILD":
                    await extendThroughGeneralizationChildren(selection, visible, extension, relevantExternalModels);
                    break;
                case "GENERALIZATION-PARENT":
                    await extendThroughGeneralizationParents(selection, visible, extension, relevantExternalModels);
                    break;
                case "PROFILE-CLASS":
                    await extendThroughProfileParents(selection, visible, extension, relevantExternalModels);
                    await extendThroughProfileChildren(selection, visible, extension, relevantExternalModels);
                    break;
                case "PROFILE-CLASS-PARENT":
                    await extendThroughProfileParents(selection, visible, extension, relevantExternalModels);
                    break;
                case "PROFILE-CLASS-CHILD":
                    await extendThroughProfileChildren(selection, visible, extension, relevantExternalModels);
                    break;
            }
        }

        if(semanticModelFilter === null) {
            return extension;
        }
        return filterExtensionUsingSemanticModelFilters(extension, semanticModelFilter);
    };