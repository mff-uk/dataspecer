
export type DiagramNodeTypes = Node | VisualModelDiagramNode;

export type DiagramOptions = {

  labelVisual: LabelVisual;

  entityMainColor: EntityColor;

  profileOfVisual: ProfileOfVisual;

  /**
   * Show range label using {@link labelVisual} and cardinality.
   */
  displayRangeDetail: boolean;

  /**
   * When true <<profile>> is shown for relationship profiles.
   */
  displayRelationshipProfileArchetype: boolean;

}

export enum LabelVisual {
  /**
   * Use entity's IRI.
   */
  Iri,
  /**
   * Use entity label.
   */
  Entity,
  /**
   * Use labels from profiled vocabularies or entity.
   */
  VocabularyOrEntity,
}

export enum EntityColor {
  /**
   * Use entity model color.
   */
  Entity,
  /**
   * Use majority of vocabularies model color, or entity's model color.
   */
  VocabularyOrEntity,
}

export enum ProfileOfVisual {
  /**
   * Do not display profile of information.
   */
  None,
  /**
   * Use profile label.
   */
  Entity,
  /**
   * Use profile IRI.
   */
  Iri,
}

/**
 * Node can be a class or a class profile.
 */
export type Node = {

  options: DiagramOptions;

  type: NodeType;

  /**
   * Entity identifier in scope of the diagram.
   */
  identifier: string;

  /**
   * Identifier of external entity associated with this node.
   */
  externalIdentifier: string;

  /**
   * Human readable label.
   */
  label: string;

  /**
   * Human readable description.
   */
  description: string | null;

  /**
   * Absolute, prefixed or relative IRI of the represented entity.
   */
  iri: string | null;

  /**
   * Color to use for given entity.
   */
  color: string;

  /**
   * Group this node belongs to.
   */
  group: string | null;

  /**
   * Position of the Node at the canvas.
   */
  position: AnchoredPosition;

  /**
   * Directly profiled entities.
   */
  profileOf: {

    label: string;

    /**
     * Absolute, prefixed or relative IRI of the represented entity.
     */
    iri: string | null;

  }[];

  /**
   * Profiled vocabulary entities.
   */
  vocabulary: {

    label: string | null;

    /**
     * Absolute, prefixed or relative IRI of the represented entity.
     */
    iri: string | null;

    color: string;

  }[];

  /**
   * Node content, i.e. attributes, properties.
   */
  items: NodeItem[];

}

export enum NodeType {
  /**
   * Represents a class.
   */
  Class,
  /**
   * Represents a class profile.
   */
  ClassProfile
}

/**
 * Represents the visual diagram node.
 * The node contains other nodes, which are present in other visual model (and hides them inside).
 */
export type VisualModelDiagramNode = {

  /**
   * Entity identifier in scope of the diagram.
   */
  identifier: string;

  /**
   * Identifier of external entity associated with this node. That is the represented visual model.
   */
  externalIdentifier: string;

  /**
   * Human readable label.
   */
  label: string;

  /**
   * The alias of the represented visual model
   */
  representedModelAlias: string;

  /**
   * Group this node belongs to.
   */
  group: string | null;

  /**
   * Position of the Node at the canvas.
   */
  position: AnchoredPosition;

}

export function isVisualModelDiagramNode(what: DiagramNodeTypes): what is VisualModelDiagramNode {
  return (what as any)?.representedModelAlias !== undefined;
}

export interface AnchoredPosition extends Position {

  /**
   * Used by layout algorithm to express desire of user
   * to not move the element.
   */
  anchored: true | null;

}

export interface Position {

  x: number;

  y: number;

}

export interface NodeItem {

  type: string;

}

export const NODE_ITEM_TYPE = "node-relationship-item";

export interface NodeRelationshipItem extends NodeItem {

  options: DiagramOptions;

  type: typeof NODE_ITEM_TYPE;

  identifier: string;

  label: string;

  /**
   * Absolute, prefixed or relative IRI of the represented entity.
   */
  iri: string | null;

  /**
   * Directly profiled entities.
   */
  profileOf: {

    label: string;

    /**
     * Absolute, prefixed or relative IRI of the represented entity.
     */
    iri: string | null;

  }[];

  /**
   * Profiled vocabulary entities.
   */
  vocabulary: {

    label: string | null;

    /**
     * Absolute, prefixed or relative IRI of the represented entity.
     */
    iri: string | null;

  }[];

  cardinalitySource: string | null;

  cardinalityTarget: string | null;

  range: null | {

    label: string;

    /**
     * Absolute, prefixed or relative IRI of the represented entity.
     */
    iri: string | null;

    /**
     * Profiled vocabulary entities.
     */
    vocabulary: {

      label: string | null;

      /**
       * Absolute, prefixed or relative IRI of the represented entity.
       */
      iri: string | null;

    }[];

  }

}

export function isNodeRelationshipItem(
  node: NodeItem,
): node is NodeRelationshipItem {
  return node.type === NODE_ITEM_TYPE;
}

export const NODE_TITLE_ITEM_TYPE = "node-title-item";

export interface NodeTitleItem extends NodeItem {

  type: typeof NODE_TITLE_ITEM_TYPE;

  title: string;

}

export function isNodeTitleItem(
  node: NodeItem,
): node is NodeTitleItem {
  return node.type === NODE_TITLE_ITEM_TYPE;
}

export type GroupWithContent = {

  /**
   * The group.
   */
  group: Group,

  /**
   * The group's content.
   */
  content: string[],

}

/**
 * Non-visual node used to represent group of other nodes.
 */
export type Group = {

  identifier: string;

}

export type ViewportDimensions = {

  position: Position;

  width: number;

  height: number;

}

/**
 * Any form of relation that should be rendered as an edge.
 */
export type Edge = {

  options: DiagramOptions;

  type: EdgeType;

  identifier: string;

  /**
   * Identifier of external entity associated with this node.
   */
  externalIdentifier: string;

  /**
   * Human readable label.
   */
  label: string | null;

  /**
   * Absolute, prefixed or relative IRI of the represented entity.
   */
  iri: string | null;

  source: string;

  cardinalitySource: string | null;

  target: string;

  cardinalityTarget: string | null;

  /**
   * Color to use for given entity.
   */
  color: string;

  waypoints: Waypoint[];

  mandatoryLevelLabel: string | null;

  /**
   * Directly profiled entities.
   */
  profileOf: {

    label: string;

    /**
     * Absolute, prefixed or relative IRI of the represented entity.
     */
    iri: string | null;

  }[];

  /**
   * Profiled vocabulary entities.
   */
  vocabulary: {

    label: string | null;

    /**
     * Absolute, prefixed or relative IRI of the represented entity.
     */
    iri: string | null;

    color: string;

  }[];

}

export enum EdgeType {
  /**
   * Represents an association.
   */
  Association,
  /**
   * Represents a profile of a association.
   */
  AssociationProfile,
  /**
   * Represents a generalization.
   */
  Generalization,
  /**
   * Represents a class profile.
   */
  ClassProfile,
}

export type Waypoint = {

  x: number;

  y: number;

}
