import { applyConfigurationModelSimple, interpretConfigurationModelSimple, ReadableConfigurationModel, WritableConfigurationModel } from "@dataspecer/core-v2/configuration-model";
import { getDefaultUserGivenAlgorithmConfigurationsFull, UserGivenAlgorithmConfigurations } from "./configurations/user-algorithm-configurations.ts";

export function createLayoutConfiguration(configuration: ReadableConfigurationModel): UserGivenAlgorithmConfigurations {
  return interpretConfigurationModelSimple<UserGivenAlgorithmConfigurations>(configuration, LAYOUT_ALGORITHM_CONFIGURATION_IRI, getDefaultUserGivenAlgorithmConfigurationsFull());
}

export function applyLayoutConfiguration(configurationModel: WritableConfigurationModel, configuration: UserGivenAlgorithmConfigurations) {
  applyConfigurationModelSimple(configurationModel, LAYOUT_ALGORITHM_CONFIGURATION_IRI, configuration);
}

export const LAYOUT_ALGORITHM_CONFIGURATION_IRI = "http://dataspecer.com/resources/local/layout-configuration";
