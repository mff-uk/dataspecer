import {
    CsvSchema,
    TableSchema,
    Column
} from "./csv-schema-model";
import {
    StructureModel,
    StructureModelPrimitiveType,
    StructureModelProperty,
    StructureModelClass
} from "../structure-model";
import { DataSpecification } from "../data-specification/model";
import {
    assert,
    assertFailed,
    LanguageString
} from "../core";
import { OFN } from "../well-known";

/**
 * This function creates CSV schema from StructureModel and DataSpecification.
 */
export function structureModelToCsvSchema(
    specification: DataSpecification,
    model: StructureModel
) : CsvSchema {
    assert(model.roots.length === 1, "Exactly one root class must be provided.");
    const schema = new CsvSchema();
    schema["@id"] = "https://ofn.gov.cz/schema/" + specification.artefacts[4].publicUrl;

    schema.tableSchema = new TableSchema();
    fillTableSchemaRecursive(model.classes, schema.tableSchema, model.roots[0], "");

    // adds rdf:type virtual column
    const virtualCol = new Column();
    virtualCol.virtual = true;
    virtualCol.propertyUrl = "rdf:type";
    virtualCol.valueUrl = model.classes[model.roots[0]].cimIri;
    schema.tableSchema.columns.push(virtualCol);

    return schema;
}

/**
 * This function recursively adds columns to the table schema. It calls itself if it finds an association with some properties.
 * @param classes Object with used classes
 * @param tableSchema The table schema to be filled
 * @param currentClass The parameter of recursion
 * @param prefix Prefix of created columns
 */
function fillTableSchemaRecursive (
    classes: { [i: string]: StructureModelClass },
    tableSchema: TableSchema,
    currentClass: string,
    prefix: string
) : void {
    for (const property of classes[currentClass].properties) {
        const dataType = property.dataTypes[0];
        if (dataType.isAssociation()) {
            const associatedClass = dataType.psmClassIri;
            if (classes[associatedClass].properties.length === 0) tableSchema.columns.push(makeSimpleColumn(property, prefix, "string"));
            else fillTableSchemaRecursive(classes, tableSchema, associatedClass, prefix + property.technicalLabel + "_");
        }
        else if (dataType.isAttribute()) tableSchema.columns.push(makeSimpleColumn(property, prefix, structureModelPrimitiveToCsvDefinition(dataType)));
        else assertFailed("Unexpected datatype!");
    }
}

/**
 * This function creates a simple column and fills its data.
 * @param property Most of the column's data are taken from this property.
 * @param namePrefix Name of the column has this prefix.
 * @param datatype The column has this datatype.
 * @returns The new and prepared column
 */
function makeSimpleColumn(
    property: StructureModelProperty,
    namePrefix: string,
    datatype: string | null
) : Column {
    const column = new Column();
    column.name = namePrefix + property.technicalLabel;
    column.titles = property.humanLabel;
    column.propertyUrl = property.cimIri;
    column["dc:description"] = transformLanguageString(property.humanDescription);
    column.lang = "cs";
    column.datatype = datatype;
    return column;
}

/**
 * This function transforms our common language string to CSVW format.
 * @param langString Language string for transformation
 * @returns Different representation of the language string used in CSVW
 */
function transformLanguageString (
    langString: LanguageString
) : { [i: string]: string } | { [i: string]: string }[] | null {
    if (!langString) return null;
    const languages = Object.keys(langString);
    if (languages.length === 0) return null;
    if (languages.length === 1) return { "@value": langString[languages[0]], "@lang": languages[0] };
    const result = [];
    for (const language in langString) result.push({ "@value": langString[language], "@lang": language });
    return result;
}

/**
 * This function translates primitive types from structure model to CSVW types according to https://www.w3.org/TR/tabular-metadata/#datatypes.
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
