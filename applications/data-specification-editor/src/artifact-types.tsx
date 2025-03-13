import { CSV_SCHEMA } from "@dataspecer/csv/csv-schema";
import { JSON_LD_GENERATOR } from "@dataspecer/json/json-ld";
import { JSON_SCHEMA } from "@dataspecer/json/json-schema";
import { XML_SCHEMA } from "@dataspecer/xml/xml-schema";

export const ArtifactType = {
    [JSON_SCHEMA.Generator]: "JSON Schema",
    [JSON_LD_GENERATOR]: "JSON-LD",
    [XML_SCHEMA.Generator]: "XML Schema",
    [CSV_SCHEMA.Generator]: "CSV Schema",
}
