import {
    CsvSchema,
    SingleTableSchema,
    MultipleTableSchema,
    Table,
    TableSchema,
    Column,
    ForeignKey,
    Reference,
    IRI,
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

class TableUrlGenerator {
    private num = 0;
    private readonly prefix: string;

    constructor(prefix: string) {
        this.prefix = "https://ofn.gov.cz/schema" + prefix;
    }

    getNext(): AbsoluteIRI {
        this.num++;
        return new AbsoluteIRI(this.prefix + this.num.toString() + ".csv");
    }
}

/**
 * Creates CSV schema from StructureModel, DataSpecification and a configuration.
 */
export function structureModelToCsvSchema(
    specification: DataSpecification,
    model: StructureModel,
    configuration: CsvSchemaGeneratorOptions
) : CsvSchema {
    assert(model.roots.length === 1, "Exactly one root class must be provided.");

    if (configuration.enableMultipleTableSchema) return makeMultipleTableSchema(specification, model);
    else return makeSingleTableSchema(specification, model);
}

/**
 * Creates a schema that consists of multiple tables.
 */
function makeMultipleTableSchema(
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

function makeRelationTable(
    tableUrl: IRI,
    leftTable: IRI,
    leftColumn: string,
    rightTable: IRI,
    rightColumn: string
) : Table {
    const table = new Table();
    table.url = tableUrl;
    table.tableSchema = new TableSchema();

    const firstColumn = makeReferenceColumn("LeftReference");
    table.tableSchema.columns.push(firstColumn);

    const secondColumn = makeReferenceColumn("RightReference");
    table.tableSchema.columns.push(secondColumn);

    table.tableSchema.primaryKey = [];
    table.tableSchema.primaryKey.push(firstColumn.name, secondColumn.name);

    const leftFkey = makeForeignKey(firstColumn.name, leftTable, leftColumn);
    table.tableSchema.foreignKeys.push(leftFkey);

    const rightFkey = makeForeignKey(secondColumn.name, rightTable, rightColumn);
    table.tableSchema.foreignKeys.push(rightFkey);

    return table;
}

function makeMultipleValueTable(
    tableUrl: IRI,
    property: StructureModelProperty,
    referencedTable: IRI,
    referencedColumn: string
) : Table {
    const table = new Table();
    table.url = tableUrl;
    table.tableSchema = new TableSchema();

    const firstColumn = makeReferenceColumn("Reference");
    table.tableSchema.columns.push(firstColumn);

    const secondColumn = makeColumnFromProp(property, "", true);
    table.tableSchema.columns.push(secondColumn);

    table.tableSchema.primaryKey = [];
    table.tableSchema.primaryKey.push(firstColumn.name, secondColumn.name);

    const fkey = makeForeignKey(firstColumn.name, referencedTable, referencedColumn);
    table.tableSchema.foreignKeys.push(fkey);

    return table;
}

/**
 * Creates a column for reference (foreign key).
 * @param title The title of the column
 */
function makeReferenceColumn(
    title: string
) : Column {
    const col = new Column();
    col.titles = title;
    col.name = encodeURI(col.titles);
    col.datatype = "string";
    col.required = true;
    return col;
}

/**
 * Creates a foreign key and fills its fields.
 * @param localColumn The column name of the table with the key
 * @param otherTable The IRI of the referenced table
 * @param otherColumn The column in the referenced table
 */
function makeForeignKey(
    localColumn: string,
    otherTable: IRI,
    otherColumn: string
) : ForeignKey {
    const fkey = new ForeignKey();
    fkey.columnReference = localColumn;
    fkey.reference = new Reference();
    fkey.reference.resource = otherTable;
    fkey.reference.columnReference = otherColumn;
    return fkey;
}

/**
 * Creates a schema that consists of a single table.
 */
function makeSingleTableSchema(
    specification: DataSpecification,
    model: StructureModel
) : SingleTableSchema {
    const schema = new SingleTableSchema();
    schema.table["@id"] = new AbsoluteIRI(idPrefix + specification.artefacts[4].publicUrl);
    schema.table.url = new AbsoluteIRI(idPrefix + specification.artefacts[4].publicUrl + "/table.csv");
    schema.table.tableSchema = new TableSchema();
    fillColumnsRecursive(schema.table.tableSchema.columns, model.roots[0].classes[0], "", true);
    schema.table.tableSchema.columns.push(makeTypeColumn(model.roots[0].classes[0].cimIri));
    return schema;
}

/**
 * Recursively creates columns of a denormalized table. It calls itself if it finds an association with some properties.
 * @param columns The array for created columns
 * @param currentClass The parameter of recursion
 * @param prefix Prefix of created columns
 * @param requiredSubtree Tells if the current class is in a required subtree
 */
function fillColumnsRecursive(
    columns: Column[],
    currentClass: StructureModelClass,
    prefix: string,
    requiredSubtree: boolean
) : void {
    for (const property of currentClass.properties) {
        const dataType = property.dataTypes[0];
        const required = requiredSubtree && (property.cardinalityMin > 0);
        if (dataType.isAssociation()) {
            const associatedClass = dataType.dataType;
            if (associatedClass.properties.length === 0) columns.push(makeColumnFromProp(property, prefix, required));
            else fillColumnsRecursive(columns, associatedClass, prefix + property.technicalLabel + "_", required);
        }
        else if (dataType.isAttribute()) columns.push(makeColumnFromProp(property, prefix, required));
        else assertFailed("Unexpected datatype!");
    }
}

/**
 * Creates a simple column and fills its data from the property.
 * @param property Most of the column's data are taken from this property
 * @param namePrefix Name of the column has this prefix
 * @param required The "required" field of the column
 */
function makeColumnFromProp(
    property: StructureModelProperty,
    namePrefix: string,
    required: boolean
) : Column {
    const column = new Column();
    column.titles = namePrefix + property.technicalLabel;
    column.name = encodeURI(column.titles);
    column["dc:title"] = transformLanguageString(property.humanLabel);
    column["dc:description"] = transformLanguageString(property.humanDescription);
    column.propertyUrl = new AbsoluteIRI(property.cimIri);
    column.required = required;
    const dataType = property.dataTypes[0];

    if (dataType.isAssociation()) {
        if (dataType.dataType.isCodelist) {
            column.valueUrl = new AbsoluteIRI("{+" + column.name + "}");
            column.datatype = "anyURI";
        }
        else {
            column.datatype = "string";
        }
    }
    else if (dataType.isAttribute()) {
        column.datatype = structureModelPrimitiveToCsvDefinition(dataType);
        if (column.datatype === "string") column.lang = "cs";
    }
    else assertFailed("Unexpected datatype!");

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
