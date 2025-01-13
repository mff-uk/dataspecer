import React, { useContext, useMemo, useState } from "react";

export enum Language {
  Czech = "cs",
  English = "en",
};

export const SupportedLanguages = [Language.Czech, Language.English];

/**
 * Runtime configuration that can be changed by the user.
 */
export interface Options {

  /**
   * Preferred data language.
   */
  language: Language;

  /**
   * Set primary language.
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
