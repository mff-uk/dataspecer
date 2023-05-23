import React, { useContext, useState } from "react";
import { CimAdapter } from "@dataspecer/core/cim";
import { PimClass } from "@dataspecer/core/pim/model";

export type CimAdapterContextType = {
    cim: CimAdapter;
    setCim: React.Dispatch<React.SetStateAction<CimAdapter>>;
    classes: PimClass[];
    setClasses: React.Dispatch<React.SetStateAction<PimClass[]>>;
};

export const CimAdapterContext = React.createContext(null as unknown as CimAdapterContextType);

export const useCimAdapterContext = () => {
    const { cim, setCim, classes, setClasses } = useContext(CimAdapterContext);

    const addClasses = (clses: PimClass[]) => {
        const setOfClassIris = new Set(classes.map((cls) => cls.iri));
        setClasses([...classes, ...clses.filter((cls) => !setOfClassIris.has(cls.iri))]);
    };

    const searchClasses = async (searchClass: string) => {
        addClasses(await cim.search(searchClass));
    };

    const loadNeighbors = async (ofClass: PimClass) => {
        if (!ofClass.iri) {
            console.log("class does not have iri", ofClass);
            return;
        }

        const neighborIris = await cim.getSurroundings(ofClass.iri).then((reader) => reader.listResources());

        const neighborsOrNulls = await Promise.all(neighborIris.map((iri) => cim.getClass(iri)));
        const neighbors = neighborsOrNulls.filter((v) => v !== null) as PimClass[];

        addClasses(neighbors);
    };

    return { cim, classes, addClasses, searchClasses, loadNeighbors };
};
