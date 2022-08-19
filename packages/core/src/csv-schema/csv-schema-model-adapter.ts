import {
    CsvSchema,
    SingleTableSchema,
    MultipleTableSchema,
    Table,
    TableSchema,
    Column,
    ForeignKey,
    Reference,
    AbsoluteIRI,
    CompactIRI
} from "./csv-schema-model";
import {
    StructureModel,
    StructureModelPrimitiveType,
    StructureModelProperty,
    StructureModelClass
} from "../structure-model/model";
import { DataSpecification } from "../data-specification/model";
import {
    assert,
    assertFailed,
    LanguageString
} from "../core";
import { OFN } from "../well-known";
import { CsvSchemaGeneratorOptions } from "./csv-schema-generator-options";

const idPrefix = "https://ofn.gov.cz/schema";

/**
 * Creates CSV schema from StructureModel, DataSpecification and a configuration.
 */
export function structureModelToCsvSchema(
    specification: DataSpecification,
    model: StructureModel,
    configuration: CsvSchemaGeneratorOptions
) : CsvSchema {
    assert(model.roots.length === 1, "Exactly one root class must be provided.");

    if (configuration.enableMultipleTableSchema) return createMultipleTableSchema(specification, model);
    else return createSingleTableSchema(specification, model);
}

/**
 * Creates a schema that consists of multiple tables.
 * @param specification
 * @param model
 */
function createMultipleTableSchema(
    specification: DataSpecification,
    model: StructureModel
) : MultipleTableSchema {
    const schema = new MultipleTableSchema();
    makeTablesRecursive(schema.tables, model.roots[0].classes[0], idPrefix + specification.artefacts[4].publicUrl + "/tables/", { value: 1 }, null);
    return schema;
}

/**
 * Every call of this function adds a table to tables.
 * @param tables Array to store created tables
 * @param currentClass The parameter of recursion
 * @param namePrefix Prefix for table identifier
 * @param nameNumber Number of the table in its identifier, it is in an object because it must be passed by reference
 * @param reference Reference for the foreign key
 */
function makeTablesRecursive(
    tables: Table[],
    currentClass: StructureModelClass,
    namePrefix: string,
    nameNumber: { value: number },
    reference: Reference | null
) : void {
    const table = new Table();
    tables.push(table);
    table.url = new AbsoluteIRI(namePrefix + nameNumber.value++ + ".csv");
    table.tableSchema = new TableSchema();

    const idColName = "ReferenceId";

    if (reference !== null) {
        const fkey = new ForeignKey();
        fkey.columnReference = idColName;
        fkey.reference = reference;
        table.tableSchema.foreignKeys.push(fkey);
    }

    // adds a column for identifier
    const idCol = new Column();
    idCol.name = idColName;
    idCol.datatype = "string";
    table.tableSchema.columns.push(idCol);

    for (const property of currentClass.properties) {
        const dataType = property.dataTypes[0];
        if (dataType.isAssociation()) {
            const associatedClass = dataType.dataType;
            table.tableSchema.columns.push(makeColumnFromProp(property, "", "string", associatedClass.isCodelist));
            if (associatedClass.properties.length !== 0) {
                const reference = new Reference();
                reference.resource = table.url;
                reference.columnReference = encodeURI(property.technicalLabel);
                makeTablesRecursive(tables, associatedClass, namePrefix, nameNumber, reference);
            }
        }
        else if (dataType.isAttribute()) table.tableSchema.columns.push(makeColumnFromProp(property, "", structureModelPrimitiveToCsvDefinition(dataType), false));
        else assertFailed("Unexpected datatype!");
    }
    table.tableSchema.columns.push(makeTypeColumn(currentClass.cimIri));
}

/**
 * Creates a schema that consists of a single table.
 * @param specification
 * @param model
 */
function createSingleTableSchema(
    specification: DataSpecification,
    model: StructureModel
) : SingleTableSchema {
    const schema = new SingleTableSchema();
    schema.table["@id"] = new AbsoluteIRI(idPrefix + specification.artefacts[4].publicUrl);
    schema.table.url = new AbsoluteIRI(idPrefix + specification.artefacts[4].publicUrl + "/table.csv");
    schema.table.tableSchema = new TableSchema();
    fillTableSchemaRecursive(schema.table.tableSchema, model.roots[0].classes[0], "");
    schema.table.tableSchema.columns.push(makeTypeColumn(model.roots[0].classes[0].cimIri));
    return schema;
}

/**
 * Recursively adds columns to the table schema. It calls itself if it finds an association with some properties.
 * @param tableSchema The table schema to be filled
 * @param currentClass The parameter of recursion
 * @param prefix Prefix of created columns
 */
function fillTableSchemaRecursive(
    tableSchema: TableSchema,
    currentClass: StructureModelClass,
    prefix: string
) : void {
    for (const property of currentClass.properties) {
        const dataType = property.dataTypes[0];
        if (dataType.isAssociation()) {
            const associatedClass = dataType.dataType;
            if (associatedClass.properties.length === 0) tableSchema.columns.push(makeColumnFromProp(property, prefix, "string", associatedClass.isCodelist));
            else fillTableSchemaRecursive(tableSchema, associatedClass, prefix + property.technicalLabel + "_");
        }
        else if (dataType.isAttribute()) tableSchema.columns.push(makeColumnFromProp(property, prefix, structureModelPrimitiveToCsvDefinition(dataType), false));
        else assertFailed("Unexpected datatype!");
    }
}

/**
 * Creates a simple column and fills its data from the property.
 * @param property Most of the column's data are taken from this property.
 * @param namePrefix Name of the column has this prefix.
 * @param datatype The column has this datatype.
 * @param isCodelist Does the column contain a code list?
 * @returns The new and prepared column
 */
function makeColumnFromProp(
    property: StructureModelProperty,
    namePrefix: string,
    datatype: string | null,
    isCodelist: boolean
) : Column {
    const column = new Column();
    column.name = encodeURI(namePrefix + property.technicalLabel);
    column.titles = namePrefix + property.technicalLabel;
    column["dc:title"] = transformLanguageString(property.humanLabel);
    column["dc:description"] = transformLanguageString(property.humanDescription);
    column.propertyUrl = new AbsoluteIRI(property.cimIri);
    column.required = property.cardinalityMin === 1 && property.cardinalityMax === 1;
    if (isCodelist) {
        column.valueUrl = new AbsoluteIRI("{+" + column.name + "}");
        column.datatype = "anyURI";
    }
    else {
        column.datatype = datatype;
    }
    if (column.datatype === "string" || column.datatype === null) column.lang = "cs";
    return column;
}

/**
 * Creates a virtual column rdf:type with specified valueUrl.
 */
function makeTypeColumn(
    valueUrl: string
) : Column {
    const virtualCol = new Column();
    virtualCol.virtual = true;
    virtualCol.propertyUrl = new CompactIRI("rdf", "type");
    virtualCol.valueUrl = new AbsoluteIRI(valueUrl);
    return virtualCol;
}

/**
 * Transforms our common language string to CSVW format.
 * @param langString Language string for transformation
 * @returns Different representation of the language string used in CSVW
 */
function transformLanguageString(
    langString: LanguageString
) : { [i: string]: string } | { [i: string]: string }[] | null {
    if (!langString) return null;
    const languages = Object.keys(langString);
    if (languages.length === 0) return null;
    if (languages.length === 1) return { "@value": langString[languages[0]], "@language": languages[0] };
    const result = [];
    for (const language in langString) result.push({ "@value": langString[language], "@language": language });
    return result;
}

/**
 * Translates primitive types from structure model to CSVW types according to https://www.w3.org/TR/tabular-metadata/#datatypes.
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
