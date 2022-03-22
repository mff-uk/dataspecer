import {
    CsvSchema,
    TableSchema,
    Column
} from "./csv-schema-model";
import {
    StructureModel,
    StructureModelPrimitiveType
} from "../structure-model";
import { DataSpecification } from "../data-specification/model";
import { assert } from "../core";
import {OFN} from "../well-known";

export function structureModelToCsvSchema(
    specification: DataSpecification,
    model: StructureModel
) : CsvSchema {
    assert(model.roots.length === 1, "Exactly one root class must be provided.");
    const schema = new CsvSchema();
    schema["@id"] = "https://ofn.gov.cz/schema/" + specification.artefacts[2].publicUrl;
    schema.tableSchema = new TableSchema();
    for (const prop of model.classes[model.roots[0]].properties) {
        const col = new Column();
        col.name = prop.technicalLabel;
        col.titles = prop.technicalLabel;
        col.propertyUrl = prop.cimIri;

        const dataType = prop.dataTypes[0];
        if(dataType.isAssociation()) col.datatype = "string";
        if(dataType.isAttribute()) col.datatype = structureModelPrimitiveToCsvDefinition(dataType);

        col.lang = "cs";
        schema.tableSchema.columns.push(col);
    }
    const virtualCol = new Column();
    virtualCol.virtual = true;
    virtualCol.propertyUrl = "rdf:type";
    virtualCol.valueUrl = model.classes[model.roots[0]].cimIri;
    schema.tableSchema.columns.push(virtualCol);
    return schema;
}

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
        case OFN.string:
            result = "string";
            break;
        case OFN.text:
            result = "string";
            break;
        case OFN.integer:
            result = "integer";
            break;
    }
    return result;
}
