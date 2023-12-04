import {
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { type InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import {
    createGeneralization,
    createRelationship,
    modifyGeneralization,
    modifyRelation,
} from "@dataspecer/core-v2/semantic-model/operations";
import React, { useContext } from "react";
import { ConnectionType } from "../util/connection";

export type ClassesContextType = {
    classes: Map<string, SemanticModelClassWithOrigin>; // was an array, [classId, classWithOrigin]
    setClasses: React.Dispatch<React.SetStateAction<Map<string, SemanticModelClassWithOrigin>>>;
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

    const createConnection = (model: InMemorySemanticModel, connection: ConnectionType) => {
        if (connection.connectionType == "association") {
            const result = model.executeOperation(createRelationship({ ends: connection.ends }));
            return result.success;
        } else {
            const result = model.executeOperation(
                createGeneralization({ child: connection.childEntityId, parent: connection.parentEntityId })
            );
            return result.success;
        }
    };

    const modifyConnection = (model: InMemorySemanticModel, relationId: string, connection: ConnectionType) => {
        if (connection.connectionType == "association") {
            return model.executeOperation(modifyRelation(relationId, { ends: connection.ends })).success;
        } else {
            return model.executeOperation(
                modifyGeneralization(relationId, { child: connection.childEntityId, parent: connection.parentEntityId })
            ).success;
        }
    };

    return {
        classes,
        setClasses,
        allowedClasses,
        setAllowedClasses,
        relationships,
        setRelationships,
        generalizations,
        setGeneralizations,
        createConnection,
    };
};
