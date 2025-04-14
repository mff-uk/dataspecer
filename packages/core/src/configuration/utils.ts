import {Configurator} from "./configurator.ts";

/**
 * Returns the configuration object of default configurations from given
 * configurators.
 * @param configurators
 */
export function getDefaultConfiguration(configurators: Configurator[]) {
    return configurators.reduce(
        (configurationObject, configurator) =>
            configurator.setToObject(configurationObject, configurator.getDefault()),
        {});
}

/**
 * Merges the configuration objects for given configurators.
 * @param configurators
 * @param configurations
 */
export function mergeConfigurations(configurators: Configurator[], ...configurations: object[]) {
    return configurations.reduce((result, configuration) =>
        ({
            ...result,
            ...configuration,
            ...configurators.reduce((mergedConfiguration, configurator) =>
                configurator.setToObject(mergedConfiguration, configurator.merge(
                    configurator.getFromObject(result),
                    configurator.getFromObject(configuration)
                )), {})
        }), {});
}
