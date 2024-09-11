import { Entity, EntityIdentifier } from "./entity-model/entity";

/**
 * Color in hexadecimal, must start with "#" character.
 * Should be in lower case.
 */
export type Color = string;

/**
 * Base interface for all visual entities.
 */
export interface VisualEntity extends Entity { }

/**
 * Represents an entity, i.g. class or a profile.
 */
export interface VisualNode extends VisualEntity {

    /**
     * Identifier of represented entity.
     */
    representedEntity: EntityIdentifier;

    /**
     * Identifier of the entity model.
     */
    model: string;

    /**
     * Position on canvas.
     */
    position: Position;

    /**
     * Identifiers of non-visual relationships to show as a part of the entity.
     */
    content: string[];

    /**
     * List of visual models assigned to this entity as an internal representation.
     */
    visualModels: string[];

}

export const VISUAL_NODE_TYPE = "visual-entity";

export function isVisualNode(what: Entity): what is VisualNode {
    return what.type.includes(VISUAL_NODE_TYPE);
}

export interface Position {

    x: number;

    y: number;

    /**
     * Used by layout algorithm to express desire of user
     * to not move the element.
     */
    anchored: true | null;

};

/**
 * Represent a binary relationship that should be visible as a connection.
 */
export interface VisualRelationship extends VisualEntity {

    /**
     * Identifier of represented entity.
     */
    representedRelationship: EntityIdentifier;

    /**
     * Order of waypoints is defined by the order in the array.
     */
    waypoints: Waypoint[];

}

export const VISUAL_RELATIONSHIP_TYPE = "visual-entity";

export function isVisualRelationship(what: Entity): what is VisualRelationship {
    return what.type.includes(VISUAL_RELATIONSHIP_TYPE);
}

export interface Waypoint extends Position {

}

export interface VisualGroup extends VisualEntity {

    /**
     * Used by layout algorithm to express desire of user
     * to not move the element.
     */
    anchored: true | null;

    /**
     * Identifiers of visual entities in this group.
     * A group can contain other groups.
     */
    content: string[];

}

export const VISUAL_GROUP_TYPE = "visual-group";

export function isVisualGroup(what: Entity): what is VisualGroup {
    return what.type.includes(VISUAL_GROUP_TYPE);
}

/**
 * Contain information about a model, like the semantic model.
 */
export interface ModelVisualInformation extends VisualEntity {

    /**
     * Identifier of the model.
     */
    representedModel: string;

    color: Color;

}

export const MODEL_VISUAL_TYPE = "model-visual";

export function isModelVisualInformation(what: Entity): what is ModelVisualInformation {
    return what.type.includes(MODEL_VISUAL_TYPE);
}
