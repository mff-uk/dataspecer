export type LayerArtifact = {
    filePath: string;
    exportedObjectName: string;
    sourceText: string; // code
    dependencies?: LayerArtifact[];
}