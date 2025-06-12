import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";

export interface NewCmeGeneralization {

  model: ModelDsIdentifier;

  /**
   * We to not work with IRI in an active way, that is why we allow null.
   * See https://github.com/dataspecer/dataspecer/issues/537
   */
  iri: string | null;

  /**
   * Generalized entity.
   */
  childIdentifier: EntityDsIdentifier;

  /**
   * Generalizing entity.
   */
  parentIdentifier: EntityDsIdentifier;

}

export interface CmeGeneralization extends NewCmeGeneralization {

  identifier: EntityDsIdentifier;

}
