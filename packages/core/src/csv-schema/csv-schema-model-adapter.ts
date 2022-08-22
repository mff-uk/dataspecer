import {
    CsvSchema,
    SingleTableSchema,
    MultipleTableSchema,
    Table,
    TableSchema,
    Column,
    LanguageNode,
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

const schemaPrefix = "https://ofn.gov.cz/schema";

class TableUrlGenerator {
    private num = 0;
    private readonly prefix: string;

    constructor(idPrefix: string) {
        this.prefix = schemaPrefix + idPrefix;
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
    makeTablesRecursive(schema.tables, model.roots[0].classes[0], new TableUrlGenerator(specification.artefacts[4].publicUrl + "/tables/"));
    return schema;
}

/**
 * Every call of this function adds a table to tables.
 * @param tables Array to store created tables
 * @param currentClass Parameter of recursion
 * @param urlGenerator Generator for table URLs
 * @returns IRI of the created table
 */
function makeTablesRecursive(
    tables: Table[],
    currentClass: StructureModelClass,
    urlGenerator: TableUrlGenerator
) : IRI {
    const table = new Table();
    tables.push(table);
    table.url = urlGenerator.getNext();
    table.tableSchema = new TableSchema();

    const idColumn = makeReferenceColumn("ReferenceId");
    table.tableSchema.columns.push(idColumn);
    table.tableSchema.primaryKey = idColumn.name;

    for (const property of currentClass.properties) {
        const dataType = property.dataTypes[0];
        const multipleValues = property.cardinalityMax === null || property.cardinalityMax > 1;
        const requiredValue = property.cardinalityMin > 0;
        if (dataType.isAssociation()) {
            const associatedClass = dataType.dataType;
            if (associatedClass.properties.length === 0) {
                if (multipleValues) tables.push(makeMultipleValueTable(urlGenerator.getNext(), property, table.url, idColumn.name));
                else table.tableSchema.columns.push(makeColumnFromProp(property, requiredValue));
            }
            else {
                const propTableIri = makeTablesRecursive(tables, associatedClass, urlGenerator);
                if (multipleValues) tables.push(makeRelationTable(urlGenerator.getNext(), table.url, idColumn.name, propTableIri, idColumn.name));
                else {
                    const assocCol = makeColumnFromProp(property, requiredValue);
                    table.tableSchema.columns.push(assocCol);
                    table.tableSchema.foreignKeys.push(makeForeignKey(assocCol.name, propTableIri, idColumn.name));
                }
            }
        }
        else if (dataType.isAttribute()) {
            if (multipleValues) tables.push(makeMultipleValueTable(urlGenerator.getNext(), property, table.url, idColumn.name));
            else table.tableSchema.columns.push(makeColumnFromProp(property, requiredValue));
        }
        else assertFailed("Unexpected datatype!");
    }

    table.tableSchema.columns.push(makeTypeColumn(currentClass.cimIri));
    return table.url;
}

/**
 * Creates a table which holds a relationship between two other tables.
 * @param tableUrl URL of the new table
 * @param leftTable URL of the first table
 * @param leftColumn Name of the referenced column in the first table
 * @param rightTable URL of the second table
 * @param rightColumn Name of the referenced column in the second table
 */
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

/**
 * Creates a table which holds possibly multiple values of one property and links them.
 * @param tableUrl URL of the new table
 * @param property Property with multiple values
 * @param referencedTable URL of the table to which the property belongs
 * @param referencedColumn Name of the key column in the referenced table
 */
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

    const secondColumn = makeColumnFromProp(property, true);
    table.tableSchema.columns.push(secondColumn);

    table.tableSchema.primaryKey = [];
    table.tableSchema.primaryKey.push(firstColumn.name, secondColumn.name);

    const fkey = makeForeignKey(firstColumn.name, referencedTable, referencedColumn);
    table.tableSchema.foreignKeys.push(fkey);

    return table;
}

/**
 * Creates a column for reference (foreign key).
 * @param title Title of the column
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
 * @param localColumn Column name of the table with the key
 * @param otherTable IRI of the referenced table
 * @param otherColumn Column name in the referenced table
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
    schema.table["@id"] = new AbsoluteIRI(schemaPrefix + specification.artefacts[4].publicUrl);
    schema.table.url = new AbsoluteIRI(schemaPrefix + specification.artefacts[4].publicUrl + "/table.csv");
    schema.table.tableSchema = new TableSchema();
    fillColumnsRecursive(schema.table.tableSchema.columns, model.roots[0].classes[0], "", true);
    schema.table.tableSchema.columns.push(makeTypeColumn(model.roots[0].classes[0].cimIri));
    return schema;
}

/**
 * Recursively creates columns of a denormalized table. It calls itself if it finds an association with some properties.
 * @param columns Array for created columns
 * @param currentClass Parameter of recursion
 * @param prefix Prefix of created columns
 * @param requiredSubtree Tells if the current class is in a required subtree, non-recursive calls should use true
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
            if (associatedClass.properties.length === 0) columns.push(makeColumnFromProp(property, required, prefix));
            else fillColumnsRecursive(columns, associatedClass, prefix + property.technicalLabel + "_", required);
        }
        else if (dataType.isAttribute()) columns.push(makeColumnFromProp(property, required, prefix));
        else assertFailed("Unexpected datatype!");
    }
}

/**
 * Creates a simple column and fills its data from the property.
 * @param property Most of the data of the column are taken from this property
 * @param required The "required" field of the column
 * @param namePrefix Name of the column has this prefix
 */
function makeColumnFromProp(
    property: StructureModelProperty,
    required: boolean,
    namePrefix: string = ""
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
 * @param valueUrl The "valueUrl" field of the column
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
 * @returns Transformed language string in the correct form
 */
function transformLanguageString(
    langString: LanguageString
) : LanguageNode | LanguageNode[] | null {
    if (!langString) return null;
    const languages = Object.keys(langString);
    if (languages.length === 0) return null;
    if (languages.length === 1) return new LanguageNode(langString[languages[0]], languages[0]);
    const result: LanguageNode[] = [];
    for (const language of languages) result.push(new LanguageNode(langString[language], language));
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
