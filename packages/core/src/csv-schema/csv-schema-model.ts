export abstract class CsvSchema {
    "@context": [ AbsoluteIRI, { "@language": string } ] = [ new AbsoluteIRI("http://www.w3.org/ns/csvw"), { "@language": "cs" } ];

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
    "@type": string = "TableGroup";
    "tables": Table[] = [];

    makeJsonLD(): string {
        return JSON.stringify(this, replacer, 4);
    }
}

export class Table {
    "@id": IRI | null = null;
    "@type": string = "Table";
    "url": IRI | null = null;
    "tableSchema": TableSchema | null = null;
}

export class TableSchema {
    "@type": string = "Schema";
    "columns": Column[] = [];
    "foreignKeys": ForeignKey[] = [];
    "primaryKey": string | string[] | null = null;
}

export class Column {
    "@type": string = "Column";
    "name": string | null = null;
    "titles": string | null = null;
    "dc:title": { [i: string]: string } | { [i: string]: string }[] | null = null;
    "dc:description": { [i: string]: string } | { [i: string]: string }[] | null = null;
    "propertyUrl": IRI | null = null;
    "valueUrl": IRI | null = null;
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
    "resource": IRI;
    "columnReference": string;
}

export abstract class IRI {
    abstract write(): string;
}

export class AbsoluteIRI extends IRI {
    constructor(value: string) {
        super();
        this.value = value;
    }

    "value": string;

    write(): string {
        return this.value;
    }
}

export class CompactIRI extends IRI {
    constructor(prefix: string, suffix: string) {
        super();
        this.prefix = prefix;
        this.suffix = suffix;
    }

    "prefix": string;
    "suffix": string;

    write(): string {
        return this.prefix + ":" + this.suffix;
    }
}

function replacer(
    key: any,
    value: any
) : any {
    if (value === null) return undefined;
    if (typeof value === "boolean" && !value) return undefined;
    if (Array.isArray(value) && value.length === 0) return undefined;
    if (value instanceof IRI) return value.write();
    return value;
}
