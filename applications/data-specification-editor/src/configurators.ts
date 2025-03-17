import { Configurator } from "@dataspecer/core/configuration/configurator";
import { JsonConfigurator } from "@dataspecer/json/configuration";
import { CsvConfigurator } from "@dataspecer/csv/configuration";
import { XmlConfigurator } from "@dataspecer/xml/configuration";
import { ClientConfigurator } from "./configuration";
import { DataSpecificationConfigurator } from "@dataspecer/core/data-specification/configuration";
import { TemplateArtifactConfigurator } from "@dataspecer/documentation/configuration";

/**
 * Returns all configurators for generator families that will be used in the
 * application.
 * This is the place to register your own artefact generators if you need to.
 */
export function getDefaultConfigurators(): Configurator[] {
    return [
        JsonConfigurator,
        CsvConfigurator,
        XmlConfigurator,
        ClientConfigurator,
        DataSpecificationConfigurator,
        TemplateArtifactConfigurator,
    ]
}
