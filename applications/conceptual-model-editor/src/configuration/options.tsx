import React, { useContext, useMemo, useState } from "react";

export enum Language {
  Czech = "cs",
  English = "en",
};

export const SupportedLanguages: [string, string][] = [
  [Language.Czech, "Čeština"],
  [Language.English, "English"]
];

/**
 * Runtime options that can be changed by the user.
 * Such change is expected to be reflected in the user interface.
 * As a result options are provided via React hook.
 */
export interface Options {

  /**
   * Selected data language.
   */
  language: Language;

  /**
   * Set language.
   */
  setLanguage: (language: Language) => void;

}

const OptionsContext = React.createContext<Options>(null as any);

export const OptionsContextProvider = (props: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState(Language.English);

  const context = useMemo(() => {
    return {
      language,
      setLanguage,
    };
  }, [language, setLanguage])

  return (
    <OptionsContext.Provider value={context}>
      {props.children}
    </OptionsContext.Provider>
  );
};

export const useOptions = (): Options => {
  return useContext(OptionsContext);
};
