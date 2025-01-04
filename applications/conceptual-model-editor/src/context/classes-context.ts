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
    setClasses: React.Dispatch<React.SetStateAction<SemanticModelClass[]>>;
    allowedClasses: string[];
    setAllowedClasses: React.Dispatch<React.SetStateAction<string[]>>;
    relationships: SemanticModelRelationship[];
    setRelationships: React.Dispatch<React.SetStateAction<SemanticModelRelationship[]>>;
    generalizations: SemanticModelGeneralization[];
    setGeneralizations: React.Dispatch<React.SetStateAction<SemanticModelGeneralization[]>>;
    profiles: (SemanticModelClassUsage | SemanticModelRelationshipUsage)[];
    setProfiles: React.Dispatch<React.SetStateAction<(SemanticModelClassUsage | SemanticModelRelationshipUsage)[]>>;
    sourceModelOfEntityMap: Map<string, string>;
    setSourceModelOfEntityMap: React.Dispatch<React.SetStateAction<Map<string, string>>>;
    rawEntities: (Entity | null)[];
    setRawEntities: React.Dispatch<React.SetStateAction<(Entity | null)[]>>;
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

    // ClassesContextType

    classes: SemanticModelClass[];

    setClasses: React.Dispatch<React.SetStateAction<SemanticModelClass[]>>;

    allowedClasses: string[];

    setAllowedClasses: React.Dispatch<React.SetStateAction<string[]>>;

    relationships: SemanticModelRelationship[];

    setRelationships: React.Dispatch<React.SetStateAction<SemanticModelRelationship[]>>;

    generalizations: SemanticModelGeneralization[];

    setGeneralizations: React.Dispatch<React.SetStateAction<SemanticModelGeneralization[]>>;

    profiles: (SemanticModelClassUsage | SemanticModelRelationshipUsage)[];

    setProfiles: React.Dispatch<React.SetStateAction<(SemanticModelClassUsage | SemanticModelRelationshipUsage)[]>>;

    sourceModelOfEntityMap: Map<string, string>;

    setSourceModelOfEntityMap: React.Dispatch<React.SetStateAction<Map<string, string>>>;

    rawEntities: (Entity | null)[];

    //

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
    setClasses,
    allowedClasses,
    setAllowedClasses,
    relationships,
    setRelationships,
    generalizations,
    setGeneralizations,
    profiles,
    setProfiles,
    sourceModelOfEntityMap,
    setSourceModelOfEntityMap,
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
    setClasses,
    allowedClasses,
    setAllowedClasses,
    relationships,
    setRelationships,
    generalizations,
    setGeneralizations,
    profiles,
    setProfiles,
    sourceModelOfEntityMap,
    setSourceModelOfEntityMap,
    rawEntities,
    createConnection,
  };
};
