import { applyConfigurationModelSimple, interpretConfigurationModelSimple, ReadableConfigurationModel, WritableConfigurationModel } from "@dataspecer/core-v2/configuration-model";
import { defaultConfiguration } from "./default-configuration.ts";

/**
 * Configuration key for the documentation generator.
 */
export const DOCUMENTATION_CONFIGURATION_KEY = "https://schemas.dataspecer.com/documentation-generator-config/";

export const DOCUMENTATION_MAIN_TEMPLATE_PARTIAL = "specification";

/**
 * Partial, non complete, configuration interpreted from a single configuration model.
 *
 * You need to merge this configuration to be complete!
 */
export interface PartialDocumentationConfiguration {
  /**
   * List of partials that can be used in the template.
   * Some partials have pre-defined names and are used as the main template or the main template for other parts of the documentation.
   *
   * If the partial is not present, the value can be derived from parent configuration.
   * If the partial is set to false, the value is removed.
   */
  partials: Record<string, string | false>;
}

export const defaultPartialDocumentationConfiguration: PartialDocumentationConfiguration = {
  partials: {},
};

export function createPartialDocumentationConfiguration(configuration: ReadableConfigurationModel): PartialDocumentationConfiguration {
  return interpretConfigurationModelSimple<PartialDocumentationConfiguration>(configuration, DOCUMENTATION_CONFIGURATION_KEY, defaultPartialDocumentationConfiguration);
}

export function applyPartialDocumentationConfiguration(configurationModel: WritableConfigurationModel, configuration: PartialDocumentationConfiguration) {
  applyConfigurationModelSimple(configurationModel, DOCUMENTATION_CONFIGURATION_KEY, configuration);
}

/**
 * Represents configuration for the documentation generator.
 */
export interface DocumentationConfiguration extends PartialDocumentationConfiguration {
  /**
   * List of partials that can be used in the template.
   * Some partials have pre-defined names and are used as the main template or the main template for other parts of the documentation.
   */
  partials: Record<string, string>;
}

/**
 * Default configuration for the documentation generator.
 *
 * Because the default configuration is not complete due to other generators, you may need to merge it with other configurations to get a complete configuration.
 * @see defaultDocumentationConfiguration from {@link @dataspecer/specification}.
 */
export const internalDefaultDocumentationConfiguration: DocumentationConfiguration = defaultConfiguration;

/**
 * Merges documentation configurations into a final configuration. It already includes the default configuration.
 *
 * Because the default configuration is not complete due to other generators, you may need to merge it with other configurations to get a complete configuration.
 * @see mergeDocumentationConfigurations from {@link @dataspecer/specification}.
 */
export function internalMergeDocumentationConfigurations(configurations: PartialDocumentationConfiguration[]): DocumentationConfiguration {
  const result: DocumentationConfiguration = structuredClone(internalDefaultDocumentationConfiguration);
  for (const configuration of configurations) {
    for (const key in configuration.partials) {
      if (configuration.partials[key] === false) {
        delete result.partials[key];
      } else {
        result.partials[key] = configuration.partials[key];
      }
    }
  }

  return result;
}
