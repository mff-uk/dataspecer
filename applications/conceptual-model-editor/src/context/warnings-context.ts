import React, { useContext } from "react";

export type Warning = {
    id: string;
    type: string;
    message: string;
    object: object | null;
};

export type WarningsContextType = {
    warnings: Warning[];
    setWarnings: React.Dispatch<React.SetStateAction<Warning[]>>;
};

export const WarningsContext = React.createContext(null as unknown as WarningsContextType);

export const useWarningsContext = () => {
  const { warnings, setWarnings } = useContext(WarningsContext);
  return { warnings, setWarnings };
};
