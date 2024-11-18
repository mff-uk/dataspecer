export function isLayerArtifact(obj: any): obj is LayerArtifact {
    const la = obj as LayerArtifact;
    return la !== undefined && la.exportedObjectName !== undefined;
}

export type LayerArtifact = {
    /**
     * Path where this artifact should be stored.
     */
    filePath: string;

    /**
     * The name of the object that is exported from the source file being created.
     * To be used as a reference to the object defined in this source file.
     */
    exportedObjectName: string;

    /**
     * The source code of the source file.
     */
    sourceText: string;

    /**
     * A collection of artifacts that this artifact depends on.
     * The dependent artifact are saved before this one.
     */
    dependencies?: LayerArtifact[];
}