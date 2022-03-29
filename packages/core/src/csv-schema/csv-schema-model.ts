import { LanguageString } from "../core";

export class CsvSchema {
    "@id": string | null = null;
    "@context": [ string, { "@language": string } ] = [ "http://www.w3.org/ns/csvw", { "@language": "cs" } ];
    "@type": string = "Table";
    "url": string | null = null;
    "tableSchema": TableSchema | null = null;
}

export class TableSchema {
    "@type": string = "Schema";
    "columns": Column[] = [];
    "primaryKey": string | null = null;
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
