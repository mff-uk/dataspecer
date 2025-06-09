import type {
  SemanticModelClass,
  SemanticModelGeneralization,
  SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import {
  createGeneralization,
  createRelationship,
} from "@dataspecer/core-v2/semantic-model/operations";
import React, { useContext } from "react";
import type { ConnectionType } from "../util/edge-connection";
import type { Entity } from "@dataspecer/core-v2";
import {
  SemanticModelClassProfile,
  SemanticModelRelationshipProfile,
} from "@dataspecer/core-v2/semantic-model/profile/concepts";

export type ClassesContextType = {

    classes: SemanticModelClass[];

    allowedClasses: string[];

    // Used by entities-of-model.tsx
    setAllowedClasses: React.Dispatch<React.SetStateAction<string[]>>;

    relationships: SemanticModelRelationship[];

    generalizations: SemanticModelGeneralization[];

    classProfiles: SemanticModelClassProfile[];

    relationshipProfiles: SemanticModelRelationshipProfile[];

    sourceModelOfEntityMap: Map<string, string>;

    rawEntities: (Entity | null)[];
};

export const ClassesContext = React.createContext(null as unknown as ClassesContextType);

type ResultType = {
    success: boolean;
    id?: undefined;
} | {
    success: true;
    id: string;
};

export interface UseClassesContextType  extends ClassesContextType {

    /**
     * @deprecated Replace with CME actions
     */
    createConnection: (
        model: InMemorySemanticModel,
        connection: ConnectionType,
    ) => ResultType | null;

}

/**
 * Provides all concepts we work with
 * also provides concept manipulating functions (eg create, modify, delete, ..)
 */
export const useClassesContext = (): UseClassesContextType => {
  const context = useContext(ClassesContext);

  const createConnection = (model: InMemorySemanticModel, connection: ConnectionType) => {
    if (!model || !(model instanceof InMemorySemanticModel)) {
      console.error("no local model found or is not of type InMemoryLocal");
      return null;
    }

    if (connection.type === "association") {
      return model.executeOperation(createRelationship({ ...connection }));
    } else {
      return model.executeOperation(createGeneralization({ ...connection }));
    }
  };

  return {
    ...context,
    createConnection,
  };
};
