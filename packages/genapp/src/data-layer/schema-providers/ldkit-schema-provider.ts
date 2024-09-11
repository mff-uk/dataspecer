import { DataspecerBaseSchemaProvider, SchemaProvider } from "./base-schema-provider";

export class LdkitSchemaProvider extends DataspecerBaseSchemaProvider implements SchemaProvider {

    constructor(dataSpecificationIri: string) {
        super(dataSpecificationIri, "ldkit-schema.ts", "ldkit");
    }
}
