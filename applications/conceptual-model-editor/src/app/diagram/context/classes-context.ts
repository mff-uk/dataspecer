import type {
    LanguageString,
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import {
    createClass,
    createGeneralization,
    createRelationship,
    deleteEntity,
    modifyClass,
    modifyRelation,
} from "@dataspecer/core-v2/semantic-model/operations";
import React, { useContext } from "react";
import type { ConnectionType } from "../util/edge-connection";
import type {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import {
    createClassUsage,
    createRelationshipUsage,
    modifyClassUsage,
    modifyRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/operations";
import type { Operation } from "@dataspecer/core-v2/semantic-model/operations";
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

    createAClass: (
        model: InMemorySemanticModel,
        name: LanguageString,
        iri: string,
        description: LanguageString | undefined,
    ) => ResultType;

    createConnection: (
        model: InMemorySemanticModel,
        connection: ConnectionType,
    ) => ResultType | null;

    createClassEntityUsage: (
        model: InMemorySemanticModel,
        entityType: "class" | "class-usage",
        entity: Partial<Omit<SemanticModelClassUsage, "type">> & Pick<SemanticModelClassUsage, "usageOf">
    ) => ResultType;

    createRelationshipEntityUsage: (
        model: InMemorySemanticModel,
        entityType: "relationship" | "relationship-usage",
        entity: Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">
    ) => ResultType;

    createAttribute: (
        model: InMemorySemanticModel,
        attr: Partial<Omit<SemanticModelRelationship, "type">>,
    ) => boolean | undefined;

    updateAClass: (
        model: InMemorySemanticModel,
        classId: string,
        newClass: Partial<Omit<SemanticModelClass, "type" | "id">>,
    ) => boolean;

    updateRelationship: (
        model: InMemorySemanticModel,
        entityId: string,
        newEntity: Partial<Omit<SemanticModelRelationship, "type" | "id">>,
    ) => boolean;

    updateAttribute: (
        model: InMemorySemanticModel,
        attributeId: string,
        updatedAttribute: Partial<Omit<SemanticModelRelationship, "type" | "id">>
    ) => boolean;

    updateEntityUsage: (
        model: InMemorySemanticModel,
        entityType: "class" | "relationship" | "class-usage" | "relationship-usage",
        id: string,
        entity: Partial<Omit<SemanticModelRelationshipUsage, "usageOf" | "type">>
    ) => boolean;

    updateAttributeUsage: (
        model: InMemorySemanticModel,
        attributeId: string,
        updatedAttribute: Partial<Omit<SemanticModelRelationshipUsage, "type" | "id">>
    ) => boolean;

    deleteEntityFromModel: (
        model: InMemorySemanticModel,
        entityId: string,
    ) => boolean;

    executeMultipleOperations: (
        model: InMemorySemanticModel,
        operations: Operation[],
    ) => void;

}

/**
 * provides all concepts we work with
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

    const createAClass = (
        model: InMemorySemanticModel,
        name: LanguageString,
        iri: string,
        description: LanguageString | undefined
    ) => {
        const result = model.executeOperation(
            createClass({
                name: name,
                iri: iri,
                description: description,
            })
        );
        return result;
    };

    const createConnection = (model: InMemorySemanticModel, connection: ConnectionType) => {
        if (!model || !(model instanceof InMemorySemanticModel)) {
            alert("no local model found or is not of type InMemoryLocal");
            return null;
        }

        if (connection.type == "association") {
            const result = model.executeOperation(createRelationship({ ...connection }));
            return result;
        } else {
            const result = model.executeOperation(createGeneralization({ ...connection }));
            return result;
        }
    };

    const createClassEntityUsage = (
        model: InMemorySemanticModel,
        entityType: "class" | "class-usage",
        entity: Partial<Omit<SemanticModelClassUsage, "type">> & Pick<SemanticModelClassUsage, "usageOf">
    ) => {
        if (entityType != "class" && entityType != "class-usage") {
            console.error("createClassEntityUsage failed.", model, entityType, entity);
            throw new Error("unexpected entityType");
        }
        const result = model.executeOperation(createClassUsage(entity));
        return result;
    };

    const createRelationshipEntityUsage = (
        model: InMemorySemanticModel,
        entityType: "relationship" | "relationship-usage",
        entity: Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">
    ) => {
        if (!(entityType == "relationship" || entityType == "relationship-usage")) {
            console.error(model, entityType, entity);
            throw new Error("unexpected entityType");
        }
        const result = model.executeOperation(createRelationshipUsage(entity));
        return result;
    };

    const createAttribute = (model: InMemorySemanticModel, attr: Partial<Omit<SemanticModelRelationship, "type">>) => {
        if (!model || !(model instanceof InMemorySemanticModel)) {
            alert("no local model found or is not of type InMemoryLocal");
            return;
        }
        const result = model.executeOperation(createRelationship(attr));
        return result.success;
    };

    const updateAClass = (
        model: InMemorySemanticModel,
        classId: string,
        newClass: Partial<Omit<SemanticModelClass, "type" | "id">>
    ) => {
        const result = model.executeOperation(
            modifyClass(classId, {
                ...newClass,
            })
        );
        return result.success;
    };

    const updateRelationship = (
        model: InMemorySemanticModel,
        entityId: string,
        newEntity: Partial<Omit<SemanticModelRelationship, "type" | "id">>
    ) => {
        return model.executeOperation(modifyRelation(entityId, newEntity)).success;
    };

    const updateAttribute = (
        model: InMemorySemanticModel,
        attributeId: string,
        updatedAttribute: Partial<Omit<SemanticModelRelationship, "type" | "id">>
    ) => {
        const result = model.executeOperation(modifyRelation(attributeId, updatedAttribute));
        return result.success;
    };

    const updateEntityUsage = (
        model: InMemorySemanticModel,
        entityType: "class" | "relationship" | "class-usage" | "relationship-usage",
        id: string,
        entity: Partial<Omit<SemanticModelRelationshipUsage, "usageOf" | "type">>
    ) => {
        if (entityType == "relationship-usage") {
            const result = model.executeOperation(modifyRelationshipUsage(id, entity));
            return result.success;
        } else if (entityType == "class-usage") {
            const result = model.executeOperation(modifyClassUsage(id, entity));
            return result.success;
        }
        return false;
    };

    const updateAttributeUsage = (
        model: InMemorySemanticModel,
        attributeId: string,
        updatedAttribute: Partial<Omit<SemanticModelRelationshipUsage, "type" | "id">>
    ) => {
        const result = model.executeOperation(modifyRelationshipUsage(attributeId, updatedAttribute));
        return result.success;
    };

    const deleteEntityFromModel = (model: InMemorySemanticModel, entityId: string) => {
        const result = model.executeOperation(deleteEntity(entityId));
        return result.success;
    };

    const executeMultipleOperations = (model: InMemorySemanticModel, operations: Operation[]) => {
        console.log("[classes-context] We are about to execute operations.", { operations });
        model.executeOperations(operations);
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
        createAClass,
        createConnection,
        createClassEntityUsage,
        createRelationshipEntityUsage,
        createAttribute,
        updateAClass,
        updateRelationship,
        updateAttribute,
        updateEntityUsage,
        updateAttributeUsage,
        deleteEntityFromModel,
        executeMultipleOperations,
    };
};
