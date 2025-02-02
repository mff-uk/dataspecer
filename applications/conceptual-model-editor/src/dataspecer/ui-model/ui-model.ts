import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";

/**
 * Provides a human readable able to be used in the user-interface.
 */
interface Labeled {

  displayLabel: string;

}

export enum UiModelType {
  /**
   * Default read only model.
   */
  Default,
  /**
   * Writable model.
   */
  InMemorySemanticModel,
  /**
   * Read only model.
   */
  ExternalSemanticModel,
}

export interface UiModel extends Labeled {

  dsIdentifier: ModelDsIdentifier;

  /**
   * Type of underlying model representation.
   */
  modelType: UiModelType;

  /**
   * Display color can be retrieved from the visual model.
   * If color is not available default color is used instead.
   * As a result, this value is always defined.
   */
  displayColor: string;

  /**
   * Common IRI prefix for all entities in the model.
   * This may not be available for all models!
   */
  baseIri: string | null;

}

interface Entity {

  dsIdentifier: EntityDsIdentifier;

  /**
   * We keep the model as a part of the entity.
   * As the model should not change often, this should not be a problem.
   * The fact that we always have a model for entity make it easy to work with.
   */
  model: UiModel;

  iri: string | null;

}

export interface UiReference {

  entityDsIdentifier: EntityDsIdentifier;

  modelDsIdentifier: ModelDsIdentifier;

}

interface Visual {

  /**
   * Identifier of visual entity representation in current visual model.
   */
  visualDsIdentifier: EntityDsIdentifier | null;

}

/**
 * Generalization does not have a label, instead
 * the label should be constructed from the referenced entities.
 */
export interface UiGeneralization extends Entity, Visual {

  /**
   * Generalized entity.
   */
  parent: UiReference & Labeled;

  /**
   * Generalizing entity.
   */
  child: UiReference & Labeled;

}

export interface UiClass extends Labeled, Entity, Visual {

}

/**
 * It is a profile or other entity.
 */
interface Profile {

  /**
   * We are ready to add information to the profile.
   */
  profiles: {

    profileOf: UiReference;

  }[];

}

export interface UiClassProfile extends Labeled, Entity, Visual, Profile {

}

export interface DataTypeReference {

  dsIdentifier: string;

}

interface BinaryRelationship<RangeType> {

  domain: UiReference;

  range: RangeType;

}

export interface UiAttribute extends Labeled, Entity, Visual, BinaryRelationship<DataTypeReference> {

}

export interface UiAttributeProfile extends Labeled, Entity, Visual, Profile, BinaryRelationship<DataTypeReference> {

}

export interface UiAssociation extends Labeled, Entity, Visual, BinaryRelationship<UiReference> {

}

export interface UiAssociationProfile extends Labeled, Entity, Visual, Profile, BinaryRelationship<UiReference> {

}

/**
 * Provide ability to build profile trees.
 */
export interface UiTree<EntityType, ProfileType> {

  node: EntityType;

  children: UiTree<ProfileType, ProfileType>[];

}

export interface UiModelState {

  /**
   * When null, there is no model to write to.
   * As a result, the state is read-only.
   */
  defaultWriteModel: UiModel | null;

  /**
   * Currently active visual model.
   * It is used to assign visual attributes to new, or changed, items.
   */
  visualModel: VisualModel | null;

  models: UiModel[];

  classes: UiClass[];

  classProfiles: UiClassProfile[];

  attributes: UiAttribute[];

  attributeProfiles: UiAttributeProfile[];

  associations: UiAssociation[];

  associationProfiles: UiAssociationProfile[];

  generalizations: UiGeneralization[];

}
