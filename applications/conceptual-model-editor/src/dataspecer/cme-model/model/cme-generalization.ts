import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";

export interface NewCmeGeneralization {

  model: ModelDsIdentifier;

  iri: string;

  /**
   * Generalized entity.
   */
  childIdentifier: EntityDsIdentifier;

  /**
   * Generalizing entity.
   */
  parentIdentifier: EntityDsIdentifier;

}

export interface CmeGeneralization extends NewCmeGeneralization{

  identifier: EntityDsIdentifier;

}
