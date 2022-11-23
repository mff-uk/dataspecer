import {
    SingleTableSchema,
    Column
} from "../csv-schema/csv-schema-model";
import {
    specArtefactIndex,
    idColumnTitle,
    refColumnTitle,
    leftRefColTitle,
    rightRefColTitle,
    TableUrlGenerator
} from "../csv-schema/csv-schema-model-adapter";
import {
    SparqlSelectQuery,
    SparqlNode,
    SparqlQNameNode,
    SparqlUriNode,
    SparqlVariableNode,
    SparqlTriple,
    SparqlPattern,
    SparqlOptionalPattern,
    SparqlElement
} from "@dataspecer/sparql-query";
import { RDF_TYPE_URI } from "@dataspecer/sparql-query";
import { csvwContext } from "../csv-schema/csvw-context";
import { assertFailed } from "@dataspecer/core/core";
import { DataSpecification } from "@dataspecer/core/data-specification/model";
import {
    StructureModel,
    StructureModelClass
} from "@dataspecer/core/structure-model/model";

class VariableGenerator {
    private num = 0;

    getNext(): SparqlVariableNode {
        this.num++;
        const varNode = new SparqlVariableNode();
        varNode.variableName = "v" + this.num.toString();
        return varNode;
    }
}

export function buildMultipleTableQueries(
    specification: DataSpecification,
    model: StructureModel
) : SparqlSelectQuery[] {
    const prefixes: Record<string, string> = {};
    const where = new SparqlPattern();
    where.elements = [];
    const selects: string[][] = [];
    const varGen = new VariableGenerator();
    const urlGen = new TableUrlGenerator(specification.artefacts[specArtefactIndex].publicUrl);
    buildQueriesRecursive(prefixes, where, selects, model.roots[0].classes[0], varGen, urlGen);

    const queries: SparqlSelectQuery[] = [];
    for (const select of selects) {
        const query = new SparqlSelectQuery();
        query.prefixes = prefixes;
        query.select = select;
        query.where = where;
        queries.push(query);
    }
    return queries;
}

function buildQueriesRecursive(
    prefixes: Record<string, string>,
    wherePattern: SparqlPattern,
    selects: string[][],
    currentClass: StructureModelClass,
    varGen: VariableGenerator,
    urlGen: TableUrlGenerator
) : SparqlVariableNode {
    const currentSelect: string[] = [];
    selects.push(currentSelect);
    const tableUrlCom = makeTableUrlComment(urlGen);
    const subject = varGen.getNext();
    currentSelect.push(makeAs(subject.variableName, idColumnTitle));

    const typeTriple = new SparqlTriple();
    typeTriple.subject = subject;
    const typePredicate = new SparqlUriNode();
    typePredicate.uri = RDF_TYPE_URI;
    typeTriple.predicate = typePredicate;
    typeTriple.object = nodeFromIri(currentClass.cimIri, prefixes);
    wherePattern.elements.push(typeTriple);

    for (const property of currentClass.properties) {
        const dataType = property.dataTypes[0];
        const multipleValues = property.cardinalityMax === null || property.cardinalityMax > 1;
        const requiredValue = property.cardinalityMin > 0;
        if (dataType.isAssociation()) {
            const associatedClass = dataType.dataType;
            if (associatedClass.properties.length === 0) {
                const object = varGen.getNext();
                if (property.isReverse) wherePattern.elements.push(propertyToElement(prefixes, object, property.cimIri, subject, requiredValue));
                else wherePattern.elements.push(propertyToElement(prefixes, subject, property.cimIri, object, requiredValue));
                if (multipleValues) selects.push([ makeAs(subject.variableName, refColumnTitle), makeAs(object.variableName, property.technicalLabel), makeTableUrlComment(urlGen) ]);
                else currentSelect.push(makeAs(object.variableName, property.technicalLabel));
            }
            else {
                let targetPattern = wherePattern;
                if (!requiredValue) {
                    const opt = new SparqlOptionalPattern();
                    opt.optionalPattern = new SparqlPattern();
                    opt.optionalPattern.elements = [];
                    targetPattern = opt.optionalPattern;
                    wherePattern.elements.push(opt);
                }
                const propSubject = buildQueriesRecursive(prefixes, targetPattern, selects, associatedClass, varGen, urlGen);
                if (property.isReverse) targetPattern.elements.push(propertyToElement(prefixes, propSubject, property.cimIri, subject, true));
                else targetPattern.elements.push(propertyToElement(prefixes, subject, property.cimIri, propSubject, true));
                if (multipleValues) selects.push([ makeAs(subject.variableName, leftRefColTitle), makeAs(propSubject.variableName, rightRefColTitle), makeTableUrlComment(urlGen) ]);
                else currentSelect.push(makeAs(propSubject.variableName, property.technicalLabel));
            }
        }
        else if (dataType.isAttribute()) {
            const object = varGen.getNext();
            wherePattern.elements.push(propertyToElement(prefixes, subject, property.cimIri, object, requiredValue));
            if (multipleValues) selects.push([ makeAs(subject.variableName, refColumnTitle), makeAs(object.variableName, property.technicalLabel), makeTableUrlComment(urlGen) ]);
            else currentSelect.push(makeAs(object.variableName, property.technicalLabel));
        }
        else assertFailed("Unexpected datatype!");
    }

    currentSelect.push(tableUrlCom);
    return subject;
}

function makeTableUrlComment(
    urlGen: TableUrlGenerator
) : string {
    return "# Table: " + urlGen.getNext().write();
}

function propertyToElement(
    prefixes: Record<string, string>,
    subject: SparqlNode,
    predIri: string,
    object: SparqlNode,
    required: boolean
) : SparqlElement {
    const triple = new SparqlTriple();
    triple.subject = subject;
    triple.predicate = nodeFromIri(predIri, prefixes);
    triple.object = object;
    if (required) return triple;
    else return wrapInOptional(triple);
}

function makeAs(
    varName: string,
    alias: string
) : string {
    return "(?" + varName + " AS ?" + alias + ")";
}

export function buildSingleTableQuery(
    schema: SingleTableSchema
) : SparqlSelectQuery {
    const query = new SparqlSelectQuery();
    query.prefixes = {};
    query.select = [];
    query.where = new SparqlPattern();
    query.where.elements = [];
    const commonSubject = new SparqlVariableNode();
    commonSubject.variableName = "cs";
    let objectIndex = 1;

    for (const column of schema.table.tableSchema.columns) {
        const triple = new SparqlTriple();
        triple.subject = commonSubject;
        triple.predicate = columnToPredicate(column, query.prefixes);
        const objectNode = new SparqlVariableNode();
        if (column.titles === null) {
            objectNode.variableName = "v" + objectIndex.toString();
            objectIndex++;
        }
        else {
            objectNode.variableName = column.titles;
            query.select.push("?" + objectNode.variableName);
        }
        triple.object = objectNode;

        if (column.required || column.virtual) query.where.elements.push(triple);
        else query.where.elements.push(wrapInOptional(triple));
    }
    return query;
}

function wrapInOptional(
    element: SparqlElement
) : SparqlOptionalPattern {
    const opt = new SparqlOptionalPattern();
    opt.optionalPattern = new SparqlPattern();
    opt.optionalPattern.elements = [ element ];
    return opt;
}

/**
 * Creates a SPARQL (predicate) node according to the column and adds necessary prefix to the query.
 */
export function columnToPredicate(
    column: Column,
    queryPrefixes: Record<string, string>
) : SparqlNode {
    if (column.propertyUrl !== null) return nodeFromIri(column.propertyUrl.asAbsolute().value, queryPrefixes);
    if (column.name !== null) {
        const node = new SparqlUriNode();
        node.uri = "#" + column.name;
        return node;
    }
    assertFailed("Missing property identifier in column!");
}

/**
 * Creates an RDF triple node from an IRI and adds a necessary prefix to query.
 */
function nodeFromIri(
    iriString: string,
    queryPrefixes: Record<string, string>
) : SparqlQNameNode {
    const separatedIri = splitIri(iriString);
    const prefix = addPrefix(separatedIri.namespace, queryPrefixes);
    const node = new SparqlQNameNode();
    node.qname = [prefix, separatedIri.local];
    return node;
}

/**
 * Splits full absolute IRI into a namespace and a local part.
 */
export function splitIri(
    fullIri: string
) : { namespace: string, local: string} {
    let lastBreak = 0;
    for (let i = 0; i < fullIri.length; i++) {
        if (fullIri[i] === "/" || fullIri[i] === "#") lastBreak = i;
    }
    return { namespace: fullIri.slice(0, lastBreak + 1), local: fullIri.slice(lastBreak + 1) }
}

/**
 * Creates a prefix from a namespace IRI, adds the namespace into a query and returns the prefix.
 */
export function addPrefix(
    namespaceIri: string,
    queryPrefixes: Record<string, string>
) : string {
    // Check if the namespace is already present.
    for (const ns in queryPrefixes) {
        if (queryPrefixes[ns] === namespaceIri) return ns;
    }

    // Check if the namespace is well-known.
    for (const key in csvwContext["@context"]) {
        if (csvwContext["@context"][key] === namespaceIri) {
            queryPrefixes[key] = namespaceIri;
            return key;
        }
    }

    // Find max number of generic prefix.
    const genericPrefix = "ns";
    let max = 0;
    for (const ns in queryPrefixes) {
        if (ns.slice(0, genericPrefix.length) === genericPrefix) {
            let nsNumber = parseInt(ns.slice(genericPrefix.length));
            if (nsNumber > max) max = nsNumber;
        }
    }
    const newPrefix = genericPrefix + (max + 1).toString();
    queryPrefixes[newPrefix] = namespaceIri;
    return newPrefix;
}
