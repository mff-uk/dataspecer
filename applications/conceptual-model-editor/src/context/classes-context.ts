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
import type {
  SemanticModelClassUsage,
  SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import type { Entity } from "@dataspecer/core-v2";

export type ClassesContextType = {

    classes: SemanticModelClass[];

    allowedClasses: string[];

    setAllowedClasses: React.Dispatch<React.SetStateAction<string[]>>;

    relationships: SemanticModelRelationship[];

    generalizations: SemanticModelGeneralization[];

    profiles: (SemanticModelClassUsage | SemanticModelRelationshipUsage)[];

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

export interface UseClassesContextType {

    classes: SemanticModelClass[];

    allowedClasses: string[];

    // Used by entities-of-model.tsx
    setAllowedClasses: React.Dispatch<React.SetStateAction<string[]>>;

    relationships: SemanticModelRelationship[];

    generalizations: SemanticModelGeneralization[];

    profiles: (SemanticModelClassUsage | SemanticModelRelationshipUsage)[];

    sourceModelOfEntityMap: Map<string, string>;

    rawEntities: (Entity | null)[];

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
  const {
    classes,
    allowedClasses,
    setAllowedClasses,
    relationships,
    generalizations,
    profiles,
    sourceModelOfEntityMap,
    rawEntities,
  } = useContext(ClassesContext);

  const createConnection = (model: InMemorySemanticModel, connection: ConnectionType) => {
    if (!model || !(model instanceof InMemorySemanticModel)) {
      console.error("no local model found or is not of type InMemoryLocal");
      return null;
    }

    if (connection.type === "association") {
      const result = model.executeOperation(createRelationship({ ...connection }));
      return result;
    } else {
      const result = model.executeOperation(createGeneralization({ ...connection }));
      return result;
    }
  };

  return {
    classes,
    allowedClasses,
    setAllowedClasses,
    relationships,
    generalizations,
    profiles,
    sourceModelOfEntityMap,
    rawEntities,
    createConnection,
  };
};
