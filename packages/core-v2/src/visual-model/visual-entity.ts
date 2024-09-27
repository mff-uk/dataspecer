import { Entity, EntityIdentifier } from "./entity-model/entity";
import { ModelIdentifier } from "./entity-model/entity-model";

/**
 * Color in hexadecimal, must start with "#" character.
 * Should be in lower case.
 */
export type HexColor = string;

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
     * Identifier of the entity model the represented entity belongs to.
     */
    model: ModelIdentifier;

    /**
     * Position on canvas.
     */
    position: Position;

    /**
     * Identifiers of non-visual relationships, e.g. attribute, to show as a part of the entity.
     */
    content: string[];

    /**
     * List of linked visual models assigned to this entity as its an internal representation.
     * In other words, diagrams that are assigned to this visual entity as representative diagrams.
     */
    visualModels: string[];

}

export const UNKNOWN_MODEL = "unknown-model";

export const VISUAL_NODE_TYPE = "visual-node";

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
     * Identifier of the entity model the represented relationship belongs to.
     */
    model: ModelIdentifier;

    /**
     * Order of waypoints is defined by the order in the array.
     */
    waypoints: Waypoint[];

}

export const VISUAL_RELATIONSHIP_TYPE = "visual-relationship";

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

    color: HexColor;

}

export const MODEL_VISUAL_TYPE = "visual-model-data";

export function isModelVisualInformation(what: Entity): what is ModelVisualInformation {
    return what.type.includes(MODEL_VISUAL_TYPE);
}
