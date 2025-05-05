import { useMemo } from "react";

import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import { BackendPackageService } from "@dataspecer/core-v2/project";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import type { VisualModel } from "@dataspecer/core-v2/visual-model";
import { getDefaultUserGivenAlgorithmConfigurationsFull, UserGivenAlgorithmConfigurations } from "@dataspecer/layout";
import { LAYOUT_ALGORITHM_CONFIGURATION_IRI } from "@dataspecer/core-v2/configuration-model";

export const useBackendConnection = () => {
  // Should fail already when spinning up the next app
  const service = useMemo(() => new BackendPackageService(import.meta.env.VITE_PUBLIC_APP_BACKEND!, httpFetch), []);

  const getModelsFromBackend = async (packageId: string) => {
    return service.constructSemanticModelPackageModels(packageId);
  };

  const updateSemanticModelPackageModels = async (
    packageId: string,
    models: EntityModel[],
    visualModels: VisualModel[]
  ) => {
    return service.updateSemanticModelPackageModels(packageId, models, visualModels);
  };

  const getConfigurationModelFromBackend = async (packageIdentifier: string) => {
    let configData = (await service.getResourceJsonData(packageIdentifier));
    const defaultLayoutConfig = getDefaultUserGivenAlgorithmConfigurationsFull();
    if (configData === null || configData === undefined || Object.keys(configData).length === 0) {
      configData = { "configuration": {[LAYOUT_ALGORITHM_CONFIGURATION_IRI]: defaultLayoutConfig} };
    }
    console.info("config data in layout dialog when saving", configData);

    return ((configData as any)["configuration"][LAYOUT_ALGORITHM_CONFIGURATION_IRI] as UserGivenAlgorithmConfigurations);
  };

  return {
    updateSemanticModelPackageModels,
    getModelsFromBackend,
    getConfigurationModelFromBackend,
  };
};
