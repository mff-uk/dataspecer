/**
 * Options object for CSV schema generator.
 */
export class CsvSchemaGeneratorOptions {
    enableMultipleTableSchema = false;

    /**
     * Because the object may not contain all the properties, you may use this
     * function to set missing properties to default values.
     * @param configuration
     */
    static getFromConfiguration(configuration: Partial<CsvSchemaGeneratorOptions> | null): CsvSchemaGeneratorOptions {
        const result = new CsvSchemaGeneratorOptions();
        if (configuration?.hasOwnProperty("enableMultipleTableSchema")) {
            result.enableMultipleTableSchema = !!configuration["enableMultipleTableSchema"];
        }
        return result;
    }
}
