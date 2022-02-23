import {SchemaGeneratorConfiguration} from "./interfaces/schema-generator-configuration";

/**
 * Handles the communication with the configuration server.
 */
export class ConfigurationConnector {
  /**
   * Returns the configuration of application/schema-generator from the given url.
   * @param url
   */
  public async fetchConfiguration(url: string): Promise<SchemaGeneratorConfiguration|null> {
    try {
      const response = await fetch(url);
      return await response.json() as SchemaGeneratorConfiguration;
    } catch (e) {
      console.error(e);
      console.error("Unable to load configuration.");
      return null;
    }
  }
}
