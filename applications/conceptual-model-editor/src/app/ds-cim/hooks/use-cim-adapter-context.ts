import React, { useContext, useState } from "react";
import { CimAdapter } from "@dataspecer/core/cim";
import { PimClass } from "@dataspecer/core/pim/model";

export type CimAdapterContextType = {
    cims: CimAdapter[];
    setCims: React.Dispatch<React.SetStateAction<CimAdapter[]>>;
    classes: PimClass[];
    setClasses: React.Dispatch<React.SetStateAction<PimClass[]>>;
    classes2: Map<CimAdapter, PimClass[]>;
    setClasses2: React.Dispatch<React.SetStateAction<Map<CimAdapter, PimClass[]>>>;
};

export const CimAdapterContext = React.createContext(null as unknown as CimAdapterContextType);

export const useCimAdapterContext = () => {
    const { cims, setCims, classes, setClasses, classes2, setClasses2 } = useContext(CimAdapterContext);

    const addClasses = (clses: PimClass[]) => {
        const setOfClassIris = new Set(classes.map((cls) => cls.iri));
        setClasses([...classes, ...clses.filter((cls) => !setOfClassIris.has(cls.iri))]);
    };

    const addClasses2 = (clses: PimClass[], fromCim: CimAdapter) => {
        const clssesAlreadyKnown = classes2.get(fromCim) ?? [];
        if (!clssesAlreadyKnown.length) {
            console.log("No classes found for cimAdapter (yet)", clssesAlreadyKnown, fromCim);
        }

        const setOfClassIris = new Set(clssesAlreadyKnown.map((cls) => cls.iri));
        const newClassesForCimAdapter = [...clssesAlreadyKnown, ...clses.filter((cls) => !setOfClassIris.has(cls.iri))];
        setClasses2(new Map(classes2.set(fromCim, newClassesForCimAdapter)));
    };

    const searchClasses = async (searchClass: string) => {
        const searchedClasses = await Promise.all(cims.map((cim) => cim.search(searchClass))).then((value) =>
            value.flat()
        );
        addClasses([...new Set(searchedClasses)]);

        const searchedClasses2 = await Promise.all(
            cims.map(async (cim) => {
                return { cim: cim, classes: await cim.search(searchClass) };
            })
        );

        searchedClasses2.forEach((cimAndClasses) => addClasses2(cimAndClasses.classes, cimAndClasses.cim));
        // addClasses(await cim.search(searchClass));
    };

    const loadNeighbors = async (ofClass: PimClass) => {
        if (!ofClass.iri) {
            console.log("class does not have iri", ofClass);
            return;
        }

        const neighborPromises = await Promise.all(
            cims.map((cim) =>
                cim
                    .getSurroundings(ofClass.iri!)
                    .then((reader) => reader.listResources())
                    .then((iris) => iris.map((iri) => cim.getClass(iri)))
                    .then((classesOrNulls) => classesOrNulls.filter((cls): cls is Promise<PimClass> => cls !== null))
            )
        ).then((value) => value.flat());

        const neighborsWithDuplicates = await Promise.all(neighborPromises);
        const neighbIris = new Set(neighborsWithDuplicates.map((cls) => cls.iri));

        const neighbors = neighborsWithDuplicates.filter((cls) => neighbIris.has(cls.iri));

        addClasses(neighbors);

        // const neighbs = Promise.all(
        //     neighbIris.map(iri => iri.)
        // )

        // const neighborIris = await cims[0]!.getSurroundings(ofClass.iri).then((reader) => reader.listResources());
        // const neighborsOrNulls = await Promise.all(neighborIris.map((iri) => cim.getClass(iri)));
        // const neighbors = neighborsOrNulls.filter((v) => v !== null) as PimClass[];

        // addClasses(neighbors);
    };

    return { cims, classes, classes2, searchClasses, loadNeighbors };
};
