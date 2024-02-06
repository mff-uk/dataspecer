import {
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import {
    createGeneralization,
    createRelationship,
    modifyGeneralization,
    modifyRelation,
} from "@dataspecer/core-v2/semantic-model/operations";
import React, { useContext } from "react";
import { AssociationConnectionType, ConnectionType, GeneralizationConnectionType } from "../util/connection";
import { LOCAL_MODEL_ID } from "../util/constants";

export type ClassesContextType = {
    classes: Map<string, SemanticModelClassWithOrigin>; // was an array, [classId, classWithOrigin]
    setClasses: React.Dispatch<React.SetStateAction<Map<string, SemanticModelClassWithOrigin>>>;
    allowedClasses: string[];
    setAllowedClasses: React.Dispatch<React.SetStateAction<string[]>>;
    relationships: SemanticModelRelationship[];
    setRelationships: React.Dispatch<React.SetStateAction<SemanticModelRelationship[]>>;
    attributes: SemanticModelRelationship[]; // Map<string, SemanticModelRelationship[]>;
    setAttributes: React.Dispatch<React.SetStateAction<SemanticModelRelationship[]>>; // React.Dispatch<React.SetStateAction<Map<string, SemanticModelRelationship[]>>>;
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
        attributes,
        setAttributes,
        generalizations,
        setGeneralizations,
    } = useContext(ClassesContext);

    const createConnection = (model: InMemorySemanticModel, connection: ConnectionType) => {
        if (!model || !(model instanceof InMemorySemanticModel)) {
            alert(`local model [${LOCAL_MODEL_ID}] not found or is not of type InMemoryLocal`);
            return;
        }
        if (connection.type == "association") {
            const conn = connection as AssociationConnectionType;
            const result = model.executeOperation(createRelationship({ ...conn }));
            return result.success;
        } else if (connection.type == "generalization") {
            const conn = connection as GeneralizationConnectionType;
            const result = model.executeOperation(createGeneralization({ ...conn }));
            return result.success;
        } else {
            alert(`classes-context: create-connection: unknown type ${connection}`);
            return false;
        }
    };

    const addAttribute = (model: InMemorySemanticModel, attr: Partial<Omit<SemanticModelRelationship, "type">>) => {
        if (!model || !(model instanceof InMemorySemanticModel)) {
            alert(`local model [${LOCAL_MODEL_ID}] not found or is not of type InMemoryLocal`);
            return;
        }

        const result = model.executeOperation(createRelationship(attr));
        return result.success;
    };

    return {
        classes,
        setClasses,
        allowedClasses,
        setAllowedClasses,
        relationships,
        setRelationships,
        attributes,
        setAttributes,
        generalizations,
        setGeneralizations,
        createConnection,
        addAttribute,
    };
};
