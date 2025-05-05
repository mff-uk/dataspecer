import { ConfigurationModelSerialization, RawConfigurationData } from "./serialization.ts";
import { mergePatch } from "./utils/merge-patch.ts";

export interface ReadableConfigurationModel {
  getRawData(): RawConfigurationData;
}

/**
 * Represents a single model alone that is used to configure various parts of the application or its components.
 */
export interface WritableConfigurationModel extends ReadableConfigurationModel {
  /**
   * Replaces the current configuration data with the new one.
   */
  setRawData(data: RawConfigurationData): void;

  /**
   * Patches part of the configuration data with the new one.
   * If undefined found, the property is removed.
   */
  patchRawData(data: RawConfigurationData): void;
}

export interface JsonSerializableModel {
  serializeModelToApiJsonObject(otherData: object): object;
}

export class DefaultConfigurationModel implements WritableConfigurationModel, JsonSerializableModel {
  private data: RawConfigurationData = {};

  getRawData(): RawConfigurationData {
    return this.data;
  }

  setRawData(data: RawConfigurationData): void {
    this.data = data;
  }

  patchRawData(patch: RawConfigurationData): void {
    this.setRawData(mergePatch(this.getRawData(), patch) as RawConfigurationData);
  }

  serializeModelToApiJsonObject(otherData: object): ConfigurationModelSerialization {
    return {
      ...otherData,
      configuration: this.getRawData()
    };
  }
}

/**
 * Factory method that creates the configuration model.
 */
export function createDefaultConfigurationModelFromJsonObject(data: object): DefaultConfigurationModel {
  const model = new DefaultConfigurationModel();
  model.setRawData((data as any)?.["configuration"] ?? {});
  return model;
}

export const LAYOUT_ALGORITHM_CONFIGURATION_IRI = "http://dataspecer.com/resources/local/layout-configuration";