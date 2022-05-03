export abstract class CsvSchema {
    "@context": [ string, { "@language": string } ] = [ "http://www.w3.org/ns/csvw", { "@language": "cs" } ];

    abstract makeJsonLD(): string;
}

export class SingleTableSchema extends CsvSchema {
    "table": Table = new Table();

    makeJsonLD(): string {
        const combined = { "@context": this["@context"], ...this.table }
        return JSON.stringify(combined, replacer, 4);
    }
}

export class MultipleTableSchema extends CsvSchema {
    "tables": Table[] = [];

    makeJsonLD(): string {
        return JSON.stringify(this, replacer, 4);
    }
}

export class Table {
    "@id": string | null = null;
    "@type": string = "Table";
    "url": string | null = null;
    "tableSchema": TableSchema | null = null;
}

export class TableSchema {
    "@type": string = "Schema";
    "columns": Column[] = [];
    "foreignKeys": ForeignKey[] = [];
}

export class Column {
    "@type": string = "Column";
    "name": string | null = null;
    "titles": string | null = null;
    "dc:title": { [i: string]: string } | { [i: string]: string }[] | null = null;
    "propertyUrl": string | null = null;
    "valueUrl": string | null = null;
    "dc:description": { [i: string]: string } | { [i: string]: string }[] | null = null;
    "datatype": string | null = null;
    "lang": string | null = null;
    "required": boolean = false;
    "virtual": boolean = false;
}

export class ForeignKey {
    "columnReference": string;
    "reference": Reference;
}

export class Reference {
    "resource": string;
    "columnReference": string;
}

function replacer(
    key: any,
    value: any
) : any {
    if (value === null) return undefined;
    if (typeof value === "boolean" && !value) return undefined;
    if (Array.isArray(value) && value.length === 0) return undefined;
    return value;
}
