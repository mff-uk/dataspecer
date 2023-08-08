import React, { useContext } from "react";
import { PimAssociation, PimAssociationEnd, PimAttribute, PimClass } from "@dataspecer/core/pim/model";
import { InMemoryCimAdapter, NewCimAdapter } from "../cim-adapters/cim-adapters";

export type CimAdapterContextType = {
    cims: NewCimAdapter[];
    setCims: React.Dispatch<React.SetStateAction<NewCimAdapter[]>>;
    classes: Map<NewCimAdapter, PimClass[]>;
    setClasses: React.Dispatch<React.SetStateAction<Map<NewCimAdapter, PimClass[]>>>;
    attributes: PimAttribute[];
    setAttributes: React.Dispatch<React.SetStateAction<PimAttribute[]>>;
    associations: PimAssociation[];
    setAssociations: React.Dispatch<React.SetStateAction<PimAssociation[]>>;
};

export const CimAdapterContext = React.createContext(null as unknown as CimAdapterContextType);

export const useCimAdapterContext = () => {
    const { cims, classes, attributes, associations, setClasses, setAttributes, setAssociations } =
        useContext(CimAdapterContext);

    const addClasses = (newClasses: PimClass[], fromCim: NewCimAdapter) => {
        const classesAlreadyKnown = classes.get(fromCim) ?? [];
        if (!classesAlreadyKnown.length) {
            console.log("No classes found for cimAdapter (yet)", classesAlreadyKnown, fromCim);
        }

        const setOfClassIris = new Set(classesAlreadyKnown.map((cls) => cls.iri));
        const newClassesForCimAdapter = [
            ...classesAlreadyKnown,
            ...newClasses.filter((cls) => !setOfClassIris.has(cls.iri)),
        ];
        setClasses(new Map(classes.set(fromCim, newClassesForCimAdapter)));
    };

    const searchClasses = async (searchClass: string) => {
        const searchedClasses = await Promise.all(
            cims.map(async (cim) => {
                return { cim, classes_: await cim.search(searchClass) };
            })
        );

        searchedClasses.forEach(({ cim, classes_ }) => {
            addClasses(classes_, cim);
            // FIXME: remove after PoC
            classes_.forEach(async (cls) => {
                if (cls.iri === null) {
                    console.log("class iri is null ", cls);
                    return;
                }
                addAttributes(await cim.getAttributesOf(cls.iri));
                addAssociations(await cim.getAssociationsOf(cls.iri));
            });
        });
    };

    const loadAllClasses = async (fromCim: InMemoryCimAdapter) => {
        const classes_ = await fromCim.search(".");
        addClasses(classes_, fromCim);
        // FIXME: remove after PoC
        classes_.forEach(async (cls) => {
            if (cls.iri === null) {
                console.log("class iri is null ", cls);
                return;
            }
            addAttributes(await fromCim.getAttributesOf(cls.iri));
            addAssociations(await fromCim.getAssociationsOf(cls.iri));
        });
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
        const neighborIris = new Set(neighborsWithDuplicates.map((cls) => cls.iri));

        const neighbors = neighborsWithDuplicates.filter((cls) => neighborIris.has(cls.iri));

        console.log("neighbors", neighbors);
        const cim = cims.at(-1);
        if (cim) {
            addClasses(neighbors, cim);
        }
    };

    const addAttributes = (newAttributes: PimAttribute[]) => {
        setAttributes((current) => {
            const attributeIris = new Set(
                current.map((pimAttribute) => pimAttribute.iri).filter((el): el is string => el !== null)
            );
            return [
                ...current,
                ...newAttributes.filter((pimAttribute) => pimAttribute.iri && !attributeIris.has(pimAttribute.iri)),
            ];
        }); // TODO: how does the attribute stuff work under the hood?
    };

    const getAttributesOfClass = (ofClass: PimClass) => {
        return attributes.filter((pimAttribute) => pimAttribute.pimOwnerClass === ofClass.iri);
    };

    const addAssociations = (newAssociations: PimAssociation[]) => {
        setAssociations((current) => {
            const associationIris = new Set(
                current.map((pimAssociation) => pimAssociation.iri).filter((el): el is string => el !== null)
            );
            return [
                ...current,
                ...newAssociations.filter(
                    (pimAssociation) => pimAssociation.iri && !associationIris.has(pimAssociation.iri)
                ),
            ];
        });
    };

    const getAssociationsOfClass = (ofClass: PimClass) => {
        return associations.filter((pimAssociation) => {
            const pimEnd = getClassFromIri(pimAssociation.pimEnd[0]);
            if (!pimEnd) {
                return false;
            }
            return pimAssociation.pimInterpretation === ofClass.iri;
        });
    };

    const getCimOfClass = (ofClass: PimClass) => {
        for (const [key, value] of classes) {
            if (value.find((cls) => cls.iri === ofClass.iri)) {
                return key;
            }
        }
        return null;
    };

    const getClassFromIri = (iri: string | null | undefined) => {
        if (!iri) {
            return null;
        }
        for (const [, classesInThatCim] of classes) {
            const foundClass = classesInThatCim.find((pimClass) => pimClass.iri === iri);
            if (foundClass) {
                return foundClass;
            }
        }
        return null;
    };

    return {
        cims,
        classes,
        attributes,
        associations,
        searchClasses,
        loadNeighbors,
        loadAllClasses,
        getAttributesOfClass,
        getAssociationsOfClass,
        getCimOfClass,
    };
};
