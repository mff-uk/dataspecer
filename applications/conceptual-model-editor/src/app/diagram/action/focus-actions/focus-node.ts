

export function focusNode(nodeIdentifier: string, editorApi: EditorApiContextType) {
  editorApi.focusNodes([nodeIdentifier]);
  // + Maybe error handling
}