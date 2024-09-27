import { ModelGraphContextType } from "../../context/model-context";

export function focusEdge(editorApi: EditorApiContextType, graph: ModelGraphContextType, edgeIdentifier: string) {
    const activeVisualModel = graph.aggregatorView.getActiveVisualModel();
    const ends: string[] = findEnds(edgeIdentifier, activeVisualModel);
    editorApi.focusNodes(ends);
    // + Maybe error handling
}