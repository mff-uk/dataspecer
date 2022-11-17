export function getEditorLink(dataSpecificationIri: string, dataPsmSchemaIri: string) {
    return `/editor?data-specification=${encodeURIComponent(dataSpecificationIri)}&data-psm-schema=${encodeURIComponent(dataPsmSchemaIri)}`;
}
