import { temporaryDomainRangeHelper } from "../../util/relationship-utils";

export function focusEdge(attributeIdentifier: string, editorApi: EditorApiContextType, graph: ModelGraphContextType) {
    const domainNodeIdentifier = temporaryDomainRangeHelper(attributeIdentifier);
    editorApi.focusNodes([domainNodeIdentifier]);
    // + Maybe error handling
}