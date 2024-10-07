import React, { useContext } from "react";

export const SupportedLanguages = ["en", "cs"] as const;
export type SupportedLanguageType = (typeof SupportedLanguages)[number];

export type ConfigurationContextType = {
    language: SupportedLanguageType;
    setLanguage: React.Dispatch<React.SetStateAction<SupportedLanguageType>>;
};

export const ConfigurationContext = React.createContext(null as unknown as ConfigurationContextType);

export interface UseConfigurationContextType {

    language: SupportedLanguageType;

    changeLanguage: (next: SupportedLanguageType) => void;

}

/**
 * Provides configuration of the workspace.
 */
export const useConfigurationContext = (): UseConfigurationContextType => {
    const { language, setLanguage } = useContext(ConfigurationContext);

    const changeLanguage = (nextLanguage: SupportedLanguageType) => {
        setLanguage(nextLanguage);
    };

    return { language, changeLanguage };
};
