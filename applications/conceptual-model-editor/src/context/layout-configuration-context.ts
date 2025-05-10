import { UserGivenAlgorithmConfigurations } from "@dataspecer/layout";
import React, { useContext } from "react";

export type LayoutConfigurationContextType = {
    layoutConfiguration: UserGivenAlgorithmConfigurations;
    setLayoutConfiguration: React.Dispatch<React.SetStateAction<UserGivenAlgorithmConfigurations>>;
};

export const LayoutConfigurationContext = React.createContext(null as unknown as LayoutConfigurationContextType);

export const useLayoutConfigurationContext = () => {
  const { layoutConfiguration, setLayoutConfiguration } = useContext(LayoutConfigurationContext);
  return { layoutConfiguration, setLayoutConfiguration };
};