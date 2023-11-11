import {
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import React, { useContext } from "react";

export type ClassesContextType = {
    classes: SemanticModelClassWithOrigin[];
    setClasses: React.Dispatch<React.SetStateAction<SemanticModelClassWithOrigin[]>>;
    allowedClasses: string[];
    setAllowedClasses: React.Dispatch<React.SetStateAction<string[]>>;
    relationships: SemanticModelRelationship[];
    setRelationships: React.Dispatch<React.SetStateAction<SemanticModelRelationship[]>>;
    generalizations: SemanticModelGeneralization[];
    setGeneralizations: React.Dispatch<React.SetStateAction<SemanticModelGeneralization[]>>;
};

export type SemanticModelClassWithOrigin = {
    cls: SemanticModelClass;
    origin: string; // modelId
};

export const ClassesContext = React.createContext(null as unknown as ClassesContextType);

export const useClassesContext = () => {
    const {
        classes,
        setClasses,
        allowedClasses,
        setAllowedClasses,
        relationships,
        setRelationships,
        generalizations,
        setGeneralizations,
    } = useContext(ClassesContext);

    return {
        classes,
        setClasses,
        allowedClasses,
        setAllowedClasses,
        relationships,
        setRelationships,
        generalizations,
        setGeneralizations,
    };
};
