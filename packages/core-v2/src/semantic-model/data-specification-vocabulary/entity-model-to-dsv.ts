import { Entity } from "../../entity-model";

import {
  SemanticModelEntity,
  isSemanticModelClass,
  isSemanticModelRelationship,
  isSemanticModelAttribute,
  SemanticModelRelationship,
} from "../concepts";

import {
  SemanticModelClassUsage,
  SemanticModelRelationshipUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
  isSemanticModelAttributeUsage,
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
} from "./dsv-model";

interface EntityListContainerToConceptualModelContext {

  /**
   * Given an identifier return a representing entity.
   * We need this to find out, whether profiles entity is a profile or not.
   */
  identifierToEntity: (identifier: string) => Entity | null;

  /**
   * Given an entity returns output IRI. Can be used with entities
   * from the transforming model as well as with entities from
   * identifierToEntity function.
   */
  entityToIri: (entity: SemanticModelEntity) => string;

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
  (new EntityListCOntainerToConceptualModel(context)).loadToConceptualModel(entityListContainer, result);
  return result;
}

class EntityListCOntainerToConceptualModel {

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
    modelContainer.entities.filter(isSemanticModelClassUsage).forEach((item: SemanticModelClassUsage) => {
      const classProfile = this.semanticModelClassUsageToClassProfile(item);
      result[item.id] = classProfile;
    });
    return result;
  }

  private semanticModelClassUsageToClassProfile(item: SemanticModelClassUsage): ClassProfile {
    const classProfile: ClassProfile = {
      // Profile
      iri: this.resolveIri(item.id, item.iri),
      prefLabel: this.context.languageFilter(item.name),
      usageNote: this.context.languageFilter(item.usageNote),
      profileOfIri: null,
      // ClassProfile
      $type: [ClassProfileType],
      profiledClassIri: null,
      properties: [], // We fill this later.
    }

    // We can profile either a class or a profile.
    const profileOf = this.context.identifierToEntity(item.usageOf);
    if (profileOf === null) {
      console.error(`Missing profileOf target '${item.usageOf}' for '${item.id}'.`);
    } else if (isSemanticModelClass(profileOf)) {
      classProfile.profiledClassIri = this.context.entityToIri(profileOf);
    } else if (isSemanticModelClassUsage(profileOf)) {
      classProfile.profileOfIri = this.context.entityToIri(profileOf);
    } else {
      console.warn(`Invalid profileOf for '${item.usageOf}' type '${profileOf.type}' for '${item.id}'.`)
    }
    return classProfile;
  }

  /**
   * Resolve IRI with respect to baseIri of the transformed model.
   */
  private resolveIri(identifier: string, iri: string | null): string {
    return resolveIri(this.baseIri, identifier, iri);
  }

  private loadRelationshipsToClassProfiles(modelContainer: EntityListContainer, identifierToClassProfile: Record<string, ClassProfile>): void {
    modelContainer.entities.filter(isSemanticModelRelationshipUsage).forEach(item => {
      const propertyProfile = this.semanticModelRelationshipUsageToPropertyProfile(item);
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
  private semanticModelRelationshipUsageToPropertyProfile(item: SemanticModelRelationshipUsage): { ownerIdentifier: string, profile: PropertyProfile } | null {
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
      prefLabel: this.context.languageFilter(range.name),
      usageNote: this.context.languageFilter(range.usageNote),
      profileOfIri: null, // We are not using this profileOfIri.
      // PropertyProfile
      profiledPropertyIri: null,
    };

    // For profileOfIri of we need to check what we are profiling.
    const profileOf = this.context.identifierToEntity(item.usageOf);
    if (profileOf === null) {
      console.error(`Missing profileOf with if '${item.usageOf}' for '${item.id}'.`);
    } else if (isSemanticModelRelationship(profileOf)) {
      const [_, profileOfRange] = profileOf.ends;
      if (profileOfRange === undefined) {
        console.error(`Missing end for '${profileOf.id}' as profile for '${item.id}'`);
      } else {
        propertyProfile.profiledPropertyIri = this.context.entityToIri(profileOf);
      }
    } else if (isSemanticModelRelationshipUsage(profileOf)) {
      const [_, profileOfRange] = profileOf.ends;
      if (profileOfRange === undefined) {
        console.error(`Missing end for '${profileOf.id}' as profile for '${item.id}'`);
      } else {
        propertyProfile.profiledPropertyIri = this.context.entityToIri(profileOf);
      }
    } else  {
      // It can be part of the core types.
      console.warn(`Invalid profileOf '${profileOf.id}' with type '${profileOf.type}' for '${item.id}'.`)
    }

    // Relationship can be of two types.
    if (isSemanticModelAttributeUsage(item)) {
      const attribute = extentToDatatypePropertyProfile(propertyProfile);
      if (range.concept !== null) {
        attribute.rangeDataTypeIri.push(range.concept);
      }
    } else if (isSemanticModelRelationshipUsage(item)) {
      const association = extentToObjectPropertyProfile(propertyProfile);
      if (range.concept !== null) {
        const entity = this.context.identifierToEntity(range.concept);
        if (isSemanticModelClassUsage(entity) && entity.iri !== null) {
          association.rangeClassIri.push(entity.iri);
        }
      }
    } else {
      console.warn(`Invalid relationship type '${item}'.`)
    }

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
 * We map 0 to 0, 1 to 1, and evnything else to many.
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
  // Builde index.
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
    entityToIri: (entity: SemanticModelEntity): string => {
      const baseIri = entityMap[entity.id]?.container?.baseIri ?? null;
      return resolveIri(baseIri, entity.id, entity.iri);
    },
    languageFilter
  }
}