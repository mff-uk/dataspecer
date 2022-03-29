export function getSchemaGeneratorLink(dataSpecificationIri: string, dataPsmSchemaIri: string) {
    const editSchemaGeneratorUrl = new URL(process.env.REACT_APP_SCHEMA_GENERATOR as string);
    editSchemaGeneratorUrl.searchParams.append('data-specification', dataSpecificationIri);
    editSchemaGeneratorUrl.searchParams.append('data-psm-schema', dataPsmSchemaIri);
    editSchemaGeneratorUrl.searchParams.append('backlink', window.location.href);

    return editSchemaGeneratorUrl.toString();
}
