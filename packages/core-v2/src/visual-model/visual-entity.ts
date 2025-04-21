import { Entity, EntityIdentifier } from "./entity-model/entity.ts";
import { ModelIdentifier } from "./entity-model/entity-model.ts";

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
     * Identifiers of non-visual relationships, e.g. attributes, to show as a part of the entity.
     */
    content: string[];

    /**
     * List of linked visual models assigned to this entity as its an internal representation.
     * In other words, diagrams that are assigned to this visual entity as representative diagrams.
     */
    visualModels: string[];

}

/**
 * Represents a visual node, which represents {@link representedVisualModel}.
 */
export interface VisualDiagramNode extends VisualEntity {

    /**
     * Position on canvas.
     */
    position: Position,

    /**
     * Identifier of the visual model, whuch is represented by this visual node.
     */
    representedVisualModel: string,

}

/**
 * Used for migration as the model can not be determined from the
 * visual model alone in version 0.
 */
export const UNKNOWN_MODEL = "unknown-model";

/**
 * Used for migration as the visual entity can not be determined from the
 * visual model alone in version 0.
 */
export const UNKNOWN_ENTITY = "unknown-entity";

export const VISUAL_NODE_TYPE = "visual-node";

export function isVisualNode(what: Entity): what is VisualNode {
    return what.type.includes(VISUAL_NODE_TYPE);
}


export const VISUAL_DIAGRAM_NODE_TYPE = "visual-diagram-node";

export function isVisualDiagramNode(what: Entity): what is VisualDiagramNode {
    return what.type.includes(VISUAL_DIAGRAM_NODE_TYPE);
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

    /**
     * Source visual entity.
     */
    visualSource: EntityIdentifier;

    /**
     * Target visual entity.
     */
    visualTarget: EntityIdentifier;

}

export const VISUAL_RELATIONSHIP_TYPE = "visual-relationship";

export function isVisualRelationship(what: Entity): what is VisualRelationship {
    return what.type.includes(VISUAL_RELATIONSHIP_TYPE);
}

export interface Waypoint extends Position {

}

/**
 * Represents a relationship that is defined by an entity and its property.
 * Since we also need to capture a type of property this relations
 * is defined with we use sub-classes.
 *
 * This interface should not be used directly, it only servers
 * as a base-interface.
 */
interface VisualNodeRelationship extends VisualEntity {

    /**
     * Identifier of entity facilitating the relationship.
     */
    entity: EntityIdentifier;

    /**
     * Identifier of the entity model the entity belongs to.
     */
    model: ModelIdentifier;

    /**
     * Order of waypoints is defined by the order in the array.
     */
    waypoints: Waypoint[];

    /**
     * Source visual entity.
     */
    visualSource: EntityIdentifier;

    /**
     * Target visual entity.
     */
    visualTarget: EntityIdentifier;

}

/**
 * Represents relationship based on a profile.
 */
export interface VisualProfileRelationship extends VisualNodeRelationship {

}

export const VISUAL_PROFILE_RELATIONSHIP_TYPE = "visual-profile-relationship";

export function isVisualProfileRelationship(what: Entity): what is VisualProfileRelationship {
    return what.type.includes(VISUAL_PROFILE_RELATIONSHIP_TYPE);
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

export const MODEL_VISUAL_TYPE = "http://dataspecer.com/resources/local/visual-model";

export function isModelVisualInformation(what: Entity): what is ModelVisualInformation {
    return what.type.includes(MODEL_VISUAL_TYPE);
}

/**
 * We use this entity to store view options for the visual model.
 * For example we can store the initial viewport position.
 */
export interface VisualView extends VisualEntity {

    /**
     * Initial position to set for viewport.
     */
    initialPositions: {

        x: number;

        y: number;

    } | null;

}

export const VISUAL_VIEW_TYPE = "visual-view";

export function isVisualView(what: Entity): what is VisualView {
    return what.type.includes(VISUAL_VIEW_TYPE);
}
