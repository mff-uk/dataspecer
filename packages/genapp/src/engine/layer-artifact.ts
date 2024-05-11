export type LayerArtifact = {
    fileName: string;
    exportedObjectName: string;
    sourceText?: string; // code
    dependencies?: LayerArtifact[];
}