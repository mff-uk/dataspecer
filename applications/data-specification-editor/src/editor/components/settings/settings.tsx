import React, {useMemo} from "react";
import {useLocalStorage} from "../../utils/use-local-storage";

export interface ApplicationSettings {
  useInheritanceUiInsteadOfOr: boolean;
  setUseInheritanceUiInsteadOfOr(value: boolean): void;
}

// @ts-ignore default value
export const SettingsContext = React.createContext<ApplicationSettings>(null);

/**
 * Creates ApplicationSettings object
 */
export const useApplicationSettings = () => {
  const [useInheritanceUiInsteadOfOr, setUseInheritanceUiInsteadOfOr] = useLocalStorage("settings.useInheritanceUiInsteadOfOr", true);

  return useMemo(() => ({
    useInheritanceUiInsteadOfOr,
    setUseInheritanceUiInsteadOfOr
  } as ApplicationSettings), [useInheritanceUiInsteadOfOr, setUseInheritanceUiInsteadOfOr]);
}
