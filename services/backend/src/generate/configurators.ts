import { Configurator } from "@dataspecer/core/configuration/configurator";
import { DataSpecificationConfigurator } from "@dataspecer/core/data-specification/configuration";
import { JsonConfigurator } from "@dataspecer/json/configuration";

/**
 * Returns all configurators for generator families that will be used in the
 * application.
 * This is the place to register your own artefact generators if you need to.
 */
export function getDefaultConfigurators(): Configurator[] {
    return [
        DataSpecificationConfigurator,
        JsonConfigurator,
    ]
}
