export function isLayerArtifact(obj: any): obj is LayerArtifact {
    const la = obj as LayerArtifact;
    return la !== undefined && la.exportedObjectName !== undefined;
}

export type LayerArtifact = {
    filePath: string;
    exportedObjectName: string;
    sourceText: string; // code
    dependencies?: LayerArtifact[];
}

export type CapabilityArtifactResultMap = { [capabilityName: string]: LayerArtifact };