import { LanguageString } from "../core";

export abstract class CsvSchema {
    "@context": [ string, { "@language": string } ] = [ "http://www.w3.org/ns/csvw", { "@language": "cs" } ];
}

export class SingleTableSchema extends CsvSchema {
    "table": Table = new Table();
}

export class MultipleTableSchema extends CsvSchema {
    "tables": Table[] = [];
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
    "primaryKey": string | null = null;
    "foreignKeys": ForeignKey[] = [];
}

export class Column {
    "@type": string = "Column";
    "name": string | null = null;
    "titles": LanguageString | null = null;
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
