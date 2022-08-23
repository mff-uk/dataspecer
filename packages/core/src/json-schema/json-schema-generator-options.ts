/**
 * Options object for JSON schema generator.
 */
export class JsonSchemaGeneratorOptions {
    /**
     * Technical label of a property, that will be added at the beginning of the
     * property list of interpreted class and represents iri of the entity.
     *
     * If set to false, the property won't be added.
     */
    interpretedClassIriPropertyName: string | null = null;

    /**
     * Technical label of a property, that will be added at the beginning of the
     * property list of interpreted class and represents type of the entity.
     *
     * If set to false, the property won't be added.
     */
    interpretedClassTypePropertyName: string | null = null;

    /**
     * Because the object may not contain all the properties, you may use this
     * function to set missing properties to default values.
     * @param configuration
     */
    static getFromConfiguration(configuration: Partial<JsonSchemaGeneratorOptions> | null): JsonSchemaGeneratorOptions {
        const result = new JsonSchemaGeneratorOptions();
        if (configuration?.hasOwnProperty("interpretedClassIriPropertyName")) {
            result.interpretedClassIriPropertyName = configuration["interpretedClassIriPropertyName"];
        }
        if (configuration?.hasOwnProperty("interpretedClassTypePropertyName")) {
            result.interpretedClassTypePropertyName = configuration["interpretedClassTypePropertyName"];
        }
        return result;
    }
}
