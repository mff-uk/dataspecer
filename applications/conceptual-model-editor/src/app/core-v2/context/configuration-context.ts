import React, { useContext } from "react";

export const SupportedLanguages = ["en", "cs", "es"] as const;
export type SupportedLanguageType = (typeof SupportedLanguages)[number];

export type ConfigurationContextType = {
    language: SupportedLanguageType;
    setLanguage: React.Dispatch<React.SetStateAction<SupportedLanguageType>>;
};

export const ConfigurationContext = React.createContext(null as unknown as ConfigurationContextType);

export const useConfigurationContext = () => {
    const { language, setLanguage } = useContext(ConfigurationContext);

    const changeLanguage = (toLanguage: SupportedLanguageType) => {
        setLanguage(toLanguage);
    };

    return { language, changeLanguage };
};
