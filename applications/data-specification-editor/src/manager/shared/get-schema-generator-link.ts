export function getEditorLink(dataSpecificationIri: string, dataPsmSchemaIri: string) {
    return import.meta.env.VITE_STRUCTURE_EDITOR_BASE_URL + `?data-specification=${encodeURIComponent(dataSpecificationIri)}&data-psm-schema=${encodeURIComponent(dataPsmSchemaIri)}`;
}
