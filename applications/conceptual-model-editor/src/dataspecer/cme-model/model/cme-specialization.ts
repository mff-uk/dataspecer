import { CmeReference } from "./cme-reference";

/**
 * The Dataspecer does not work with specializations but with
 * generalizations. Yet, for dialogs it is better to represent what
 * an entity is specialization of.
 *
 * The specialization is missing a link to the other entity, the specializing
 * one. This is by design, as we do not plan to use this without the entity.
 */
export interface NewCmeSpecialization {

  /**
   * We to not work with IRI in an active way, that is why we allow null.
   * See https://github.com/dataspecer/dataspecer/issues/537
   */
  iri: string | null;

  /**
   * Entity being specialized.
   */
  specializationOf: CmeReference;

}

export interface CmeSpecialization extends NewCmeSpecialization{

  /**
   * Generalization represented by this specialization.
   */
  generalization: CmeReference;

}

export function isCmeSpecialization(
  value: NewCmeSpecialization): value is CmeSpecialization {
  return (value as any)?.generalization?.identifier !== undefined;
}
