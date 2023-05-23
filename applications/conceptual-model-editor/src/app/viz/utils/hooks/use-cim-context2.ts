import React, { useContext, useState } from "react";
import { Cim } from "../../model/cim-defs";

export type CimContext2Type = {
    cims: Cim[];
    setCims: React.Dispatch<React.SetStateAction<Cim[]>>;
};

export const CimContext2 = React.createContext(null as unknown as CimContext2Type);

export const useCimContext2 = () => {
    const { cims, setCims } = useContext(CimContext2);

    const addCim = (cim: Cim) => {
        setCims([...cims, cim]);
    };

    const removeCim = (cim: Cim) => {
        setCims([...cims.filter((c) => c.id !== cim.id)]);
    };

    return { cims, addCim, removeCim };
};
