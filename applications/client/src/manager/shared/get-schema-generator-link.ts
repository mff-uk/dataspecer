export function getEditorLink(dataSpecificationIri: string, dataPsmSchemaIri: string) {
    return process.env.REACT_APP_STRUCTURE_EDITOR_BASE_URL + `?data-specification=${encodeURIComponent(dataSpecificationIri)}&data-psm-schema=${encodeURIComponent(dataPsmSchemaIri)}`;
}
