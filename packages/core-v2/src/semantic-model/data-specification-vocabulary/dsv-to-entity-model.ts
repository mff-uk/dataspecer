import { Entity } from "../../entity-model";

import {
  SemanticModelClassUsage,
  SemanticModelRelationshipUsage,
  SEMANTIC_MODEL_CLASS_USAGE,
  SEMANTIC_MODEL_RELATIONSHIP_USAGE,
  SemanticModelRelationshipEndUsage
} from "../usage/concepts";

import {
  EntityListContainer,
} from "./entity-model";

import {
  ConceptualModel,
  Cardinality,
  ClassProfile,
  PropertyProfile,
  isObjectPropertyProfile,
  isDatatypePropertyProfile,
} from "./dsv-model";

interface ConceptualModelToEntityListContainerContext {

  /**
   * Given an IRI return internal identifier.
   * This can be used for imported profiles as well as used entities.
   *
   * For imported profiles we expect to recieve a new uniq identifier.
   *
   * For used entities (profileOf), we assume the entities already exists
   * and we get back their internal identifier.
   */
  iriToidentifier: (iri: string) => string;

}

export function conceptualModelToEntityListContainer(conceptualModel: ConceptualModel, context: ConceptualModelToEntityListContainerContext): EntityListContainer {
  return (new ConceptualModelToEntityModel(context).transform(conceptualModel));
}

class ConceptualModelToEntityModel {

  private entities: Entity[] = [];

  private context: ConceptualModelToEntityListContainerContext;

  constructor(context: ConceptualModelToEntityListContainerContext) {
    this.context = context;
  }

  transform(conceptualModel: ConceptualModel): EntityListContainer {
    for (const classProfile of conceptualModel.profiles) {
      this.classProfileToEntities(classProfile);
    }
    return {
      baseIri: null,
      entities: this.entities,
    };
  }

  private classProfileToEntities(profile: ClassProfile): void {
    const usageOf = this.profileIriToUsageOfIdentifier(profile.profileOfIri, profile.profiledClassIri);
    if (usageOf === null) {
      console.error(`Missing usage for '${profile.iri}', class will be ignored.`);
      return;
    }
    const classUsage: SemanticModelClassUsage = {
      // Entity
      id: this.context.iriToidentifier(profile.iri),
      // WithUsageNote
      usageNote: profile.usageNote,
      // SemanticModelUsage
      usageOf: usageOf,
      iri: profile.iri,
      // Nullable<NamedThing>
      name: profile.prefLabel,
      description: null,
      // SemanticModelClassUsage
      type: [SEMANTIC_MODEL_CLASS_USAGE]
    };
    this.entities.push(classUsage);
    for (const propertyProfile of profile.properties) {
      this.propertyProfileToEntities(propertyProfile, classUsage);
    }
  }

  /**
   * Return useOf IRI from given arguments.
   */
  private profileIriToUsageOfIdentifier(profileOfIri: string | null, profiledVocabularyConcept: string | null): string | null {
    if (profiledVocabularyConcept != null) {
      return profiledVocabularyConcept;
    }
    if (profileOfIri !== null) {
      return this.context.iriToidentifier(profileOfIri);
    }
    return null;
  }

  private propertyProfileToEntities(profile: PropertyProfile, owner: SemanticModelClassUsage): void {
    const usageOf = this.profileIriToUsageOfIdentifier(profile.profileOfIri, profile.profiledPropertyIri);
    if (usageOf === null) {
      console.error(`Missing usage for '${profile.iri}', property will be ignored.`);
      return;
    }

    // We store only owner.id in the domain.
    const domain: SemanticModelRelationshipEndUsage = {
      // WithUsageNote
      usageNote: null,
      // Nullable<NamedThing>
      name: null,
      description: null,
      // SemanticModelRelationshipEndUsage
      cardinality: null,
      concept: owner.id,
      iri: null,
    };

    let rangeConcept : string | null = null;
    if (isDatatypePropertyProfile(profile)) {
      rangeConcept = profile.rangeDataTypeIri?.[0] ?? null;
    } else if (isObjectPropertyProfile(profile)) {
      rangeConcept = profile.rangeClassIri?.[0] ?? null;
    } else {
      console.error(`Invalid type of property for profile '${profile.iri}'.`);
      return;
    }
    if (rangeConcept === null) {
      console.error(`Property profile is null for '${profile.iri}'.`);
      return;
    } else {
      rangeConcept = this.context.iriToidentifier(rangeConcept);
    }

    const range: SemanticModelRelationshipEndUsage = {
      // WithUsageNote
      usageNote: profile.usageNote,
      // Nullable<NamedThing>
      name: profile.prefLabel,
      description: null,
      // SemanticModelRelationshipEndUsage
      cardinality: cardinalityEnumToCardinality(profile.cardinality),
      concept: rangeConcept,
      iri: profile.iri,
    };

    const propertyUsage: SemanticModelRelationshipUsage = {
      // Entity
      id: this.context.iriToidentifier(profile.iri),
      // WithUsageNote
      usageNote: profile.usageNote,
      // SemanticModelUsage
      usageOf: usageOf,
      iri: null,
      // Nullable<NamedThing>
      name: profile.prefLabel,
      description: null,
      // SemanticModelRelationshipUsage
      type: [SEMANTIC_MODEL_RELATIONSHIP_USAGE],
      ends: [domain, range],
    };

    this.entities.push(propertyUsage);
  }

}

function cardinalityEnumToCardinality(cardinality: Cardinality | null): [number, number | null] | null {
  if (cardinality === null) {
    return null;
  }
  switch (cardinality) {
    case Cardinality.ZeroToZero:
      return [0, 0];
    case Cardinality.ZeroToOne:
      return [0, 1];
    case Cardinality.ZeroToMany:
      return [0, null];
    case Cardinality.OneToZero:
      return [1, 0];
    case Cardinality.OneToOne:
      return [1, 1];
    case Cardinality.OneToMany:
      return [1, null];
    // We do not really have a way how to convert
    // ManyTo* as we can not employ null, se we just
    // use a "random" number to get same result when eporting.
    case Cardinality.ManyToZero:
      return [2, 0];
    case Cardinality.ManyToOne:
      return [2, 1];
    case Cardinality.ManyToMany:
      return [2, 0];

  }
}