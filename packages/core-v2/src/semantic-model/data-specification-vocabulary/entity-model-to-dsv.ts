import { Entity } from "../../entity-model";

import {
  SemanticModelEntity,
  isSemanticModelClass,
  isSemanticModelRelationship,
} from "../concepts";

import {
  SemanticModelClassUsage,
  SemanticModelRelationshipUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
  isSemanticModelAttributeUsage,
  SemanticModelRelationshipEndUsage,
} from "../usage/concepts";

import {
  EntityListContainer,
} from "./entity-model";

import {
  LanguageString,
  ConceptualModel,
  Cardinality,
  ClassProfile,
  ClassProfileType,
  PropertyProfile,
  ObjectPropertyProfile,
  ObjectPropertyProfileType,
  DatatypePropertyProfile,
  DatatypePropertyProfileType,
  Profile,
} from "./dsv-model";
import {
  isSemanticModelClassProfile,
  isSemanticModelRelationshipProfile,
  SemanticModelClassProfile,
  SemanticModelRelationshipEndProfile,
  SemanticModelRelationshipProfile,
} from "../profile/concepts";
import { SKOS, VANN } from "./vocabulary";
import { isDataType } from "../datatypes";

interface EntityListContainerToConceptualModelContext {

  /**
   * Given an identifier return a representing entity.
   * We need this to find out, whether profiles entity is a profile or not.
   * Must return null when the argument is null.
   */
  identifierToEntity: (identifier: string) => Entity | null;

  /**
   * Given an entity returns output IRI. Can be used with entities
   * from the transforming model as well as with entities from
   * identifierToEntity function.
   */
  entityToIri: (entity: SemanticModelEntity | SemanticModelRelationshipProfile) => string;

  /**
   * Allows for filtering of languages strings.
   */
  languageFilter: (value: LanguageString | null | undefined) => LanguageString | null;

}

/**
 * Create a conceptual model with given IRI based on the given model container to convert.
 * Others models are required
 */
export function entityListContainerToConceptualModel(
  conceptualModelIri: string,
  entityListContainer: EntityListContainer,
  context: EntityListContainerToConceptualModelContext
): ConceptualModel {
  const result: ConceptualModel = {
    iri: conceptualModelIri,
    profiles: [],
  };
  (new EntityListContainerToConceptualModel(context)).loadToConceptualModel(entityListContainer, result);
  return result;
}

class EntityListContainerToConceptualModel {

  readonly context: EntityListContainerToConceptualModelContext;

  private baseIri: string | null = null;

  constructor(context: EntityListContainerToConceptualModelContext) {
    this.context = context;
  }

  loadToConceptualModel(modelContainer: EntityListContainer, conceptualModel: ConceptualModel): void {
    this.baseIri = modelContainer.baseIri;
    const identifierToClassProfile = this.loadClassProfiles(modelContainer);
    this.loadRelationshipsToClassProfiles(modelContainer, identifierToClassProfile);
    conceptualModel.profiles = Object.values(identifierToClassProfile);
  }

  private loadClassProfiles(modelContainer: EntityListContainer): Record<string, ClassProfile> {
    const result: Record<string, ClassProfile> = {};
    modelContainer.entities.filter(
      item => isSemanticModelClassUsage(item) || isSemanticModelClassProfile(item)
    ).forEach((item) => {
      const classProfile = this.semanticClassUsageToClassProfile(item);
      result[item.id] = classProfile;
    });
    return result;
  }

  private semanticClassUsageToClassProfile(
    item: SemanticModelClassUsage | SemanticModelClassProfile,
  ): ClassProfile {

    const classProfile: ClassProfile = {
      // Profile
      iri: this.resolveIri(item.id, item.iri),
      prefLabel: {},
      definition: {},
      usageNote: {},
      profileOfIri: [],
      // ClassProfile
      $type: [ClassProfileType],
      properties: [],
      inheritsValue: [],
      profiledClassIri: [],
    };

    const profiling: (Entity | null)[] = [];
    // Type specific.
    if (isSemanticModelClassUsage(item)) {
      profiling.push(this.identifierToEntity(item.usageOf));
      this.setProfileFromUsage(item, classProfile);
    } else {
      item.profiling.forEach(item => profiling.push(this.identifierToEntity(item)));
      this.setProfileFromProfile(item, classProfile);
    }

    // We need to know what we profile to add it to the right place.
    for (const profileOf of profiling) {
      if (profileOf === null) {
        // We ignore this here, there is nothing we can do.
        continue;
      }
      if (isSemanticModelClass(profileOf)) {
        classProfile.profiledClassIri.push(
          this.context.entityToIri(profileOf));
      } else if (isSemanticModelClassUsage(profileOf)
        || isSemanticModelClassProfile(profileOf)) {
        classProfile.profileOfIri.push(
          this.context.entityToIri(profileOf))
      } else {
        console.warn(`Invalid profileOf '${profileOf.id}' of type '${profileOf.type}' for '${item.id}'.`)
      }
    }

    return classProfile;
  }

  private identifierToEntity(iri: string | null): Entity | null {
    if (iri === null) {
      return null;
    }
    const result = this.context.identifierToEntity(iri);
    if (result === null) {
      console.error(`Missing entity with IRI '${iri}'.`);
    }
    return result;
  }

  /**
   * Resolve IRI with respect to baseIri of the transformed model.
   */
  private resolveIri(identifier: string, iri: string | null): string {
    return resolveIri(this.baseIri, identifier, iri);
  }

  /**
   * Adds inheritsValue values for usage.
   */
  private setProfileFromUsage(
    item: {
      usageOf: string,
      name: LanguageString | null,
      description: LanguageString | null,
      usageNote: LanguageString | null,
    },
    profile: Profile,
  ) {
    if (item.name === null) {
      profile.inheritsValue.push({
        inheritedPropertyIri: SKOS.prefLabel.id,
        propertyValueFromIri: this.resolveIri(item.usageOf, null),
      });
    } else {
      profile.prefLabel = this.prepareString(item.name);
    }
    if (item.description === null) {
      profile.inheritsValue.push({
        inheritedPropertyIri: SKOS.definition.id,
        propertyValueFromIri: this.resolveIri(item.usageOf, null),
      });
    } else {
      profile.definition = this.prepareString(item.description);
    }
    if (item.usageNote === null) {
      profile.inheritsValue.push({
        inheritedPropertyIri: VANN.usageNote.id,
        propertyValueFromIri: this.resolveIri(item.usageOf, null),
      });
    } else {
      profile.usageNote = this.prepareString(item.usageNote);
    }
  }

  /**
   * Prepare string to DSV, we represent empty string as null.
   * The reason is both are same in RDF.
   */
  private prepareString (value: LanguageString | null): LanguageString {
    const result = this.context.languageFilter(value);
    if (result === null) {
      return {};
    }
    return Object.keys(result).length === 0 ? {} : result;
  };

  /**
   * Adds inheritsValue values for profile.
   */
  private setProfileFromProfile(
    item: {
      name: LanguageString | null,
      nameFromProfiled: string | null,
      description: LanguageString | null
      descriptionFromProfiled: string | null,
      usageNote: LanguageString | null
      usageNoteFromProfiled: string | null,
    },
    profile: Profile,
  ) {
    if (item.nameFromProfiled === null)  {
      profile.prefLabel = this.prepareString(item.name);
    } else {
      profile.inheritsValue.push({
        inheritedPropertyIri: SKOS.prefLabel.id,
        propertyValueFromIri: this.resolveIri(item.nameFromProfiled, null),
      });
    }
    if (item.descriptionFromProfiled === null) {
      profile.definition = this.prepareString(item.description);
    } else {
      profile.inheritsValue.push({
        inheritedPropertyIri: SKOS.definition.id,
        propertyValueFromIri: this.resolveIri(item.descriptionFromProfiled, null),
      });
    }
    if (item.usageNoteFromProfiled === null)  {
      profile.usageNote = this.prepareString(item.usageNote);
    } else {
      profile.inheritsValue.push({
        inheritedPropertyIri: VANN.usageNote.id,
        propertyValueFromIri: this.resolveIri(item.usageNoteFromProfiled, null),
      });
    }
  }

  private loadRelationshipsToClassProfiles(
    modelContainer: EntityListContainer,
    identifierToClassProfile: Record<string, ClassProfile>,
  ): void {
    modelContainer.entities.filter(isSemanticModelRelationshipUsage).forEach(item => {
      const propertyProfile = this.semanticRelationshipUsageToPropertyProfile(item);
      if (propertyProfile == null) {
        return;
      }
      const owner = identifierToClassProfile[propertyProfile.ownerIdentifier];
      if (owner === undefined) {
        console.warn(`Missing owner for '${item.id}' of type '${item.type}'. Relationship is ignored.`);
        return;
      }
      owner?.properties.push(propertyProfile.profile);
    });
    // And once more for profiles.
    modelContainer.entities.filter(isSemanticModelRelationshipProfile).forEach(item => {
      const propertyProfile = this.semanticRelationshipProfileToPropertyProfile(item);
      if (propertyProfile == null) {
        return;
      }
      const owner = identifierToClassProfile[propertyProfile.ownerIdentifier];
      if (owner === undefined) {
        console.warn(`Missing owner for '${item.id}' of type '${item.type}'. Relationship is ignored.`);
        return;
      }
      owner?.properties.push(propertyProfile.profile);
    });
  }

  /**
   * DataSpecer consider relationship as an entity with two ends.
   * In our case all the information is stored in the ends, especially the second end.
   * We denote the ends domain and range.
   *
   * As decided, spring 2024, property IRI, name, usageNote, etc .. are stored in the range.
   */
  private semanticRelationshipUsageToPropertyProfile(
    item: SemanticModelRelationshipUsage,
  ): { ownerIdentifier: string, profile: PropertyProfile } | null {
    const [domain, range] = item.ends;
    if (domain === undefined || range === undefined) {
      console.error(`Expected two ends for '${item.id}'.`);
      return null;
    }
    if (domain.concept === null) {
      console.error(`Missing 'ends[0].concept' (owner) for '${item.id}'.`);
      return null;
    }

    const propertyProfile: PropertyProfile = {
      // Profile
      iri: this.resolveIri(item.id, range.iri),
      cardinality: cardinalityToCardinalityEnum(range.cardinality),
      prefLabel: {},
      definition: {},
      usageNote: {},
      profileOfIri: [],
      // PropertyProfile
      profiledPropertyIri: [],
      inheritsValue: [],
    };

    // For profileOfIri of we need to check what we are profiling.
    const profileOf = this.context.identifierToEntity(item.usageOf);
    if (profileOf === null) {
      console.error(`Missing profileOf '${item.usageOf}' for '${item.id}'.`);
    } else {
      this.addProfileToPropertyProfile(profileOf, propertyProfile);
    }

    this.setProfileFromUsage({
      // Part of the state is at the range and part at the property.
      ...range,
      usageOf: item.usageOf,
      usageNote: item.usageNote,
    }, propertyProfile);
    this.addRangeConceptToPropertyProfile(item, range, propertyProfile);

    return {
      ownerIdentifier: domain.concept,
      profile: propertyProfile,
    };
  }

  /**
   * Add information about range concept to the property.
   */
  private addRangeConceptToPropertyProfile(
    item: SemanticModelRelationshipUsage | SemanticModelRelationshipProfile,
    range: SemanticModelRelationshipEndUsage | SemanticModelRelationshipEndProfile,
    propertyProfile: PropertyProfile
  ) {
    // Now we need to store the range, we store it base on the
    // relationship type.
    const rangeConcept = range.concept;
    if (rangeConcept === null) {
      console.warn("Range concept is null.", item);
    } else if (isDataType(rangeConcept)) {
      // It is an attribute.
      const attribute = extentToDatatypePropertyProfile(propertyProfile);
      attribute.rangeDataTypeIri.push(rangeConcept);
    } else {
      // It is an association.
      const association = extentToObjectPropertyProfile(propertyProfile);
      const entity = this.context.identifierToEntity(rangeConcept);
      if (isSemanticModelClassUsage(entity) || isSemanticModelClassProfile(entity)) {
        if (entity.iri !== null) {
          association.rangeClassIri.push(entity.iri);
        }
      } else {
        console.warn("Range concent of a profile is not a profile.", {
          profile: item, range: entity,
        });
      }
    }
  }

  private addProfileToPropertyProfile(
    profileOf: Entity,
    profile: PropertyProfile,
  ) {
    if (isSemanticModelRelationship(profileOf)) {
      profile.profiledPropertyIri.push(this.context.entityToIri(profileOf));
    } else if (isSemanticModelRelationshipUsage(profileOf)) {
      profile.profileOfIri.push(this.context.entityToIri(profileOf));
    } else if (isSemanticModelRelationshipProfile(profileOf)) {
      profile.profileOfIri.push(this.context.entityToIri(profileOf));
    } else {
      // It can be part of the core types.
      console.warn(`Invalid profileOf '${profileOf.id}' with type '${profileOf.type}'.`)
    }
  }

  private semanticRelationshipProfileToPropertyProfile(
    item: SemanticModelRelationshipProfile,
  ): { ownerIdentifier: string, profile: PropertyProfile } | null {
    const [domain, range] = item.ends;
    if (domain === undefined || range === undefined) {
      console.error(`Expected two ends for '${item.id}'.`);
      return null;
    }
    if (domain.concept === null) {
      console.error(`Missing 'ends[0].concept' (owner) for '${item.id}'.`);
      return null;
    }

    const propertyProfile: PropertyProfile = {
      // Profile
      iri: this.resolveIri(item.id, range.iri),
      cardinality: cardinalityToCardinalityEnum(range.cardinality),
      prefLabel: {},
      definition: {},
      usageNote: {},
      profileOfIri: [],
      // PropertyProfile
      profiledPropertyIri: [],
      inheritsValue: [],
    };

    for (const iri of range.profiling) {
      const profileOf = this.context.identifierToEntity(iri);
      if (profileOf === null) {
        console.error(`Missing profileOf '${iri}' for '${item.id}'.`);
      } else {
        this.addProfileToPropertyProfile(profileOf, propertyProfile);
      }
    }

    this.setProfileFromProfile(range, propertyProfile);
    this.addRangeConceptToPropertyProfile(item, range, propertyProfile);

    return {
      ownerIdentifier: domain.concept,
      profile: propertyProfile,
    };
  }

}

/**
 * Given model base IRI, entity identifier and entity IRI return the output entity IRI.
 * We use identifier as a fallback.
 */
function resolveIri(baseIri: string | null, identifier: string, iri: string | null): string {
  const candidate = iri ?? identifier;
  if (baseIri === null) {
    return candidate;
  }
  if (candidate.includes("://")) {
    // Absolute IRI.
    return candidate;
  }
  return baseIri + candidate;
}

/**
 * We have only tree values: 0, 1, and many.
 * We map 0 to 0, 1 to 1, and everything else to many.
 */
function cardinalityToCardinalityEnum(cardinality: [number, number | null] | null): Cardinality | null {
  if (cardinality === null) {
    // Cardinality is not specified.
    return null;
  }
  const [start, end] = cardinality;
  if (start === 0) {
    if (end === 0) {
      return Cardinality.ZeroToZero;
    } else if (end === 1) {
      return Cardinality.ZeroToOne;
    } else {
      return Cardinality.ZeroToMany;
    }
  } else if (start === 1) {
    if (end === 0) {
      return Cardinality.OneToZero;
    } else if (end === 1) {
      return Cardinality.OneToOne;
    } else {
      return Cardinality.OneToMany;
    }
  } else {
    if (end === 0) {
      return Cardinality.ManyToZero;
    } else if (end === 1) {
      return Cardinality.ManyToOne;
    } else {
      return Cardinality.ManyToMany;
    }
  }
}

function extentToDatatypePropertyProfile(property: PropertyProfile): DatatypePropertyProfile {
  (property as any).$type = [DatatypePropertyProfileType];
  (property as any).rangeDataTypeIri = [];
  return property as DatatypePropertyProfile;
}

function extentToObjectPropertyProfile(property: PropertyProfile): ObjectPropertyProfile {
  (property as any).$type = [ObjectPropertyProfileType];
  (property as any).rangeClassIri = [];
  return property as ObjectPropertyProfile;
}

/**
 * Create context from all given models.
 */
export function createContext(containers: EntityListContainer[], languageFilter: (value: LanguageString | null | undefined) => LanguageString | null): EntityListContainerToConceptualModelContext {
  // Build index.
  const entityMap: { [identifier: string]: { entity: Entity, container: EntityListContainer } } = {};
  for (const container of containers) {
    for (const entity of container.entities) {
      entityMap[entity.id] = {
        container,
        entity
      };
    }
  }
  //
  return {
    identifierToEntity: (identifier: string): Entity | null => {
      return entityMap[identifier]?.entity ?? null;
    },
    entityToIri: (entity: SemanticModelEntity | SemanticModelRelationshipProfile): string => {
      const baseIri = entityMap[entity.id]?.container?.baseIri ?? null;
      // Relations store IRI in the range end.
      let iri: string | null = null;
      if (isSemanticModelRelationship(entity)
        || isSemanticModelRelationshipProfile(entity)) {
        const [_, range] = entity.ends;
        iri = range?.iri ?? iri;
      } else {
        iri = entity.iri;
      }
      return resolveIri(baseIri, entity.id, iri);
    },
    languageFilter
  }
}
