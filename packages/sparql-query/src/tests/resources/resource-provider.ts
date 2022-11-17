import { readFileSync } from "fs";
import { join } from "path";

export function getResource(fileName) {
    return JSON.parse(readFileSync(join(__dirname, fileName), "utf8"));
}

/*
Resource files in this directory come from the ZIP file generated in Specification Manager.
They are resources/merged_store.json and resources/data_specification.json in the ZIP file.
*/
