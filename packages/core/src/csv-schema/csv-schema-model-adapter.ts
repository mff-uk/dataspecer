import {
    CsvSchema,
    TableSchema,
    Column
} from "./csv-schema-model";
import {
    StructureModel,
    StructureModelPrimitiveType, StructureModelProperty
} from "../structure-model";
import { DataSpecification } from "../data-specification/model";
import { assert } from "../core";
import { OFN } from "../well-known";

export function structureModelToCsvSchema(
    specification: DataSpecification,
    model: StructureModel
) : CsvSchema {
    assert(model.roots.length === 1, "Exactly one root class must be provided.");
    const schema = new CsvSchema();
    schema["@id"] = "https://ofn.gov.cz/schema/" + specification.artefacts[2].publicUrl;
    schema.tableSchema = createTableSchemaFromProperties(model.classes[model.roots[0]].properties);

    // adds rdf:type virtual column
    const virtualCol = new Column();
    virtualCol.virtual = true;
    virtualCol.propertyUrl = "rdf:type";
    virtualCol.valueUrl = model.classes[model.roots[0]].cimIri;
    schema.tableSchema.columns.push(virtualCol);

    return schema;
}

/**
 * This function creates columns of table schema according to provided properties.
 * @param properties Properties of root class in structure model
 * @returns Table schema with columns in it
 */
function createTableSchemaFromProperties (
    properties: StructureModelProperty[]
) : TableSchema {
    const tableSchema = new TableSchema();
    for (const prop of properties) {
        const col = new Column();
        col.name = prop.technicalLabel;
        col.titles = prop.technicalLabel;
        col.propertyUrl = prop.cimIri;

        const dataType = prop.dataTypes[0];
        if(dataType.isAssociation()) col.datatype = "string";
        if(dataType.isAttribute()) col.datatype = structureModelPrimitiveToCsvDefinition(dataType);

        col.lang = "cs";
        tableSchema.columns.push(col);
    }
    return tableSchema;
}

/**
 * This function translates primitive types from structure model to CSVW types according to https://www.w3.org/TR/tabular-metadata/#datatypes
 * @param primitive Primitive type from structure model
 * @returns String name of the translated datatype or null if not applicable
 */
function structureModelPrimitiveToCsvDefinition(
    primitive: StructureModelPrimitiveType
) : string | null {
    let result = null;
    switch (primitive.dataType) {
        case OFN.boolean:
            result = "boolean";
            break;
        case OFN.date:
            result = "date";
            break;
        case OFN.time:
            result = "time";
            break;
        case OFN.dateTime:
            result = "dateTime";
            break;
        case OFN.integer:
            result = "integer";
            break;
        case OFN.decimal:
            result = "decimal";
            break;
        case OFN.url:
            result = "anyURI";
            break;
        case OFN.string:
            result = "string";
            break;
        case OFN.text:
            result = "string";
            break;
    }
    return result;
}
