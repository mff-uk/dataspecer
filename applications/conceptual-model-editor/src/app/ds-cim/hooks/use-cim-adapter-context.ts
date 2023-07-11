import React, { useContext } from "react";
import { PimClass } from "@dataspecer/core/pim/model";
import { InMemoryCimAdapter, NewCimAdapter } from "../cim-adapters/cim-adapters";

export type CimAdapterContextType = {
    cims: NewCimAdapter[];
    setCims: React.Dispatch<React.SetStateAction<NewCimAdapter[]>>;
    classes: PimClass[];
    setClasses: React.Dispatch<React.SetStateAction<PimClass[]>>;
    classes2: Map<NewCimAdapter, PimClass[]>;
    setClasses2: React.Dispatch<React.SetStateAction<Map<NewCimAdapter, PimClass[]>>>;
};

export const CimAdapterContext = React.createContext(null as unknown as CimAdapterContextType);

export const useCimAdapterContext = () => {
    const { cims, classes, setClasses, classes2, setClasses2 } = useContext(CimAdapterContext);

    const addClasses = (clses: PimClass[]) => {
        const setOfClassIris = new Set(classes.map((cls) => cls.iri));
        setClasses([...classes, ...clses.filter((cls) => !setOfClassIris.has(cls.iri))]);
    };

    const addClasses2 = (clses: PimClass[], fromCim: NewCimAdapter) => {
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

    const loadAllClasses = async (fromCim: InMemoryCimAdapter) => {
        addClasses2(await fromCim.search("."), fromCim);
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
            )
        ).then((value) => value.flat());

        const neighborsWithDuplicates = (await Promise.all(neighborPromises)).filter(
            (clsOrNull): clsOrNull is PimClass => clsOrNull !== null
        );
        const neighbIris = new Set(neighborsWithDuplicates.map((cls) => cls.iri));

        const neighbors = neighborsWithDuplicates.filter((cls) => neighbIris.has(cls.iri));

        console.log("neighbors", neighbors);
        const cim = cims.at(-1);
        if (cim) {
            addClasses2(neighbors, cim);
        }
    };

    return { cims, classes, classes2, searchClasses, loadNeighbors, loadAllClasses };
};
