import { assertFailed } from "@dataspecer/core/core";
import { csvwContext } from "./csvw-context";

export abstract class CsvSchema {
    "@context": [ AbsoluteIri, { "@language": string } ] = [ new AbsoluteIri("http://www.w3.org/ns/csvw"), { "@language": "cs" } ];

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
    "@id": Iri | null = null;
    "@type": string = "Table";
    "url": Iri | null = null;
    "tableSchema": TableSchema | null = null;
}

export class TableSchema {
    "@type": string = "Schema";
    "columns": Column[] = [];
    "primaryKey": string | string[] | null = null;
    "foreignKeys": ForeignKey[] = [];
}

export class Column {
    "@type": string = "Column";
    "name": string | null = null;
    "titles": string | null = null;
    "dc:title": LanguageNode | LanguageNode[] | null = null;
    "dc:description": LanguageNode | LanguageNode[] | null = null;
    "propertyUrl": Iri | null = null;
    "valueUrl": Iri | null = null;
    "datatype": string | null = null;
    "lang": string | null = null;
    "required": boolean = false;
    "virtual": boolean = false;
}

export class LanguageNode {
    constructor(value: string, language: string) {
        this["@value"] = value;
        this["@language"] = language;
    }

    readonly "@value": string;
    readonly "@language": string;
}

export class ForeignKey {
    "columnReference": string;
    "reference": Reference;
}

export class Reference {
    "resource": Iri;
    "columnReference": string;
}

export abstract class Iri {
    abstract write(): string;
    abstract asAbsolute(): AbsoluteIri;
}

export class AbsoluteIri extends Iri {
    constructor(value: string) {
        super();
        this.value = value;
    }

    readonly "value": string;

    write(): string {
        return this.value;
    }
    asAbsolute(): AbsoluteIri {
        return new AbsoluteIri(this.value);
    }
}

export class CompactIri extends Iri {
    constructor(prefix: string, suffix: string) {
        super();
        this.prefix = prefix;
        this.suffix = suffix;
    }

    readonly "prefix": string;
    readonly "suffix": string;

    write(): string {
        return this.prefix + ":" + this.suffix;
    }
    asAbsolute(): AbsoluteIri {
        let absolute = csvwContext["@context"][this.prefix];
        if (absolute === undefined || typeof absolute !== "string") assertFailed("Undefined prefix!");
        absolute += this.suffix;
        return new AbsoluteIri(absolute);
    }
}

function replacer(
    key: any,
    value: any
) : any {
    if (value === null) return undefined;
    if (typeof value === "boolean" && !value) return undefined;
    if (Array.isArray(value) && value.length === 0) return undefined;
    if (value instanceof Iri) return value.write();
    return value;
}
