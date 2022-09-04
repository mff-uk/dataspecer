import {JsonConfigurator} from "../json/json-configuration";
import {CsvConfigurator} from "../csv-schema/csv-configuration";
import {XmlConfigurator} from "../xml/xml-configuration";
import {Configurator} from "./configurator";

export function createDefaultConfigurators(): Configurator[] {
    return [
        JsonConfigurator,
        CsvConfigurator,
        XmlConfigurator,
    ]
}
