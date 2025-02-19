import { Entity } from "../../entity-model";

import { EntityListContainer } from "./entity-model";

import {
  ConceptualModel,
  Cardinality,
  ClassProfile,
  PropertyProfile,
  isObjectPropertyProfile,
  isDatatypePropertyProfile,
  PropertyInheritance,
} from "./dsv-model";

import {
  SEMANTIC_MODEL_CLASS_PROFILE,
  SEMANTIC_MODEL_RELATIONSHIP_PROFILE,
  SemanticModelClassProfile,
  SemanticModelRelationshipEndProfile,
  SemanticModelRelationshipProfile,
} from "../profile/concepts";
import { SKOS, VANN } from "./vocabulary";

interface ConceptualModelToEntityListContainerContext {

  /**
   * Given an IRI return internal identifier.
   * This can be used for imported profiles as well as used entities.
   *
   * For imported profiles we expect to receive a new uniq identifier.
   *
   * For used entities (profileOf), we assume the entities already exists
   * and we get back their internal identifier.
   */
  iriToIdentifier: (iri: string) => string;

}

export function conceptualModelToEntityListContainer(
  conceptualModel: ConceptualModel,
  context: ConceptualModelToEntityListContainerContext,
): EntityListContainer {
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
    const profiling = [
      ...this.profilesToIdentifier(profile.profileOfIri),
      ...this.profilesToIdentifier(profile.profiledClassIri),
    ];
    const classProfile: SemanticModelClassProfile = {
      // SemanticModelEntity
      iri: profile.iri,
      // Entity
      id: this.context.iriToIdentifier(profile.iri),
      type: [SEMANTIC_MODEL_CLASS_PROFILE],
      // Profile
      profiling,
      usageNote: profile.usageNote,
      usageNoteFromProfiled: selectFromProfiled(profile, VANN.usageNote.id),
      // NamedThingProfile
      name: profile.prefLabel,
      nameFromProfiled: selectFromProfiled(profile, SKOS.prefLabel.id),
      description: profile.definition,
      descriptionFromProfiled: selectFromProfiled(profile, SKOS.definition.id),
    };
    this.entities.push(classProfile);
    // Convert relationships.
    for (const propertyProfile of profile.properties) {
      this.propertyProfileToEntities(propertyProfile, classProfile);
    }
  }

  private profilesToIdentifier(items: string[]): string[] {
    return items.map(iri => this.context.iriToIdentifier(iri));
  }

  private propertyProfileToEntities(
    profile: PropertyProfile, owner: SemanticModelClassProfile,
  ): void {
    const profiling = [
      ...this.profilesToIdentifier(profile.profileOfIri),
      ...this.profilesToIdentifier(profile.profiledPropertyIri),
    ];

    const domain: SemanticModelRelationshipEndProfile = {
      iri: null,
      concept: owner.id,
      cardinality: null,
      // NamedThingProfile
      name: null,
      nameFromProfiled: null,
      description: null,
      descriptionFromProfiled: null,
      // Profile
      profiling: [],
      usageNote: null,
      usageNoteFromProfiled: null,
    };

    let rangeConcept: string | null = null;
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
      rangeConcept = this.context.iriToIdentifier(rangeConcept);
    }

    const range: SemanticModelRelationshipEndProfile = {
      iri: profile.iri,
      concept: rangeConcept,
      cardinality: cardinalityEnumToCardinality(profile.cardinality),
      // NamedThingProfile
      name: profile.prefLabel,
      nameFromProfiled: selectFromProfiled(profile, SKOS.prefLabel.id),
      description: profile.definition,
      descriptionFromProfiled: selectFromProfiled(profile, SKOS.definition.id),
      // Profile
      profiling,
      usageNote: profile.usageNote,
      usageNoteFromProfiled: selectFromProfiled(profile, VANN.usageNote.id),
    };

    const propertyUsage: SemanticModelRelationshipProfile = {
      ends: [domain, range],
      // Entity
      id: this.context.iriToIdentifier(profile.iri),
      type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
    };

    this.entities.push(propertyUsage);
  }

}

function selectFromProfiled(profile: {
  inheritsValue: PropertyInheritance[],
}, property: string): string | null {
  const inheritsValue = profile.inheritsValue.find(
    item => item.inheritedPropertyIri === property);
  return inheritsValue?.propertyValueFromIri ?? null;
}

function cardinalityEnumToCardinality(
  cardinality: Cardinality | null,
): [number, number | null] | null {
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
    // use a "random" number to get same result when exporting.
    case Cardinality.ManyToZero:
      return [2, 0];
    case Cardinality.ManyToOne:
      return [2, 1];
    case Cardinality.ManyToMany:
      return [2, 0];
  }
}
