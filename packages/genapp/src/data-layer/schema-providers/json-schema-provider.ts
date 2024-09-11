import { DataspecerBaseSchemaProvider, SchemaProvider } from "./base-schema-provider";

export class JsonSchemaProvider extends DataspecerBaseSchemaProvider implements SchemaProvider {

    constructor(dataSpecificationIri: string) {
        super(dataSpecificationIri, "schema.json", "json");
    }
}
