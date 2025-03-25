export interface ConfigurationModelSerialization {
  /**
   * The configuration data.
   */
  configuration: RawConfigurationData;
}

/**
 * The object that holds the configuration in raw form.
 */
export type RawConfigurationData = Record<string, any>;