import { Entity } from "../../entity-model";

import {
  LanguageString,
  //
  ConceptualClass,
  ConceptualAttribute,
  ConceptualRelationship,
  ConceptualDatatype,
  //
  ConceptualModel,
  Profile,
  ClassProfile,
  ClassProfileType,
  PropertyProfile,
  ObjectPropertyProfile,
  ObjectPropertyProfileType,
  DatatypePropertyProfile,
  DatatypePropertyProfileType,
  ControlledVocabulary,
  //
  DataSpecification,
  Vocabulary,
  VocabularyType,
  ApplicationProfile,
  ApplicationProfileType,
} from "./model/";

import {
  SemanticModelClass,
  isSemanticModelClass,
  isSemanticModelGeneralization,
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

export interface ModelContainer {
  identifier: string,
  alias: string,
  entities: Entity[],
}

interface EntitiesToApplicationProfileConfiguration {

  /**
   * Each model can be published as a separate data specification.
   * A data specification is identified by IRI which is configured here.
   */
  modelIdentifierToSpecificationIri: (identifier: string) => string;

  /**
   * Each model can be published as a data profile.
   * A data profile has one conceptual model which needs IRI.
   */
  modelIdentifierToConceptualModelIri: (iri: string) => string;

  languageFilter: (value: LanguageString | null | undefined) => LanguageString | null;

}

const isSemanticModelRelationshipWrap = (entity: Entity): entity is SemanticModelRelationship => {
  return isSemanticModelRelationship(entity) && !isSemanticModelAttribute(entity);
}

/**
 * This function is not ready! It is just a proof-of-concept converting
 * list of entities into data specification vocabulary.
 * 
 * @param entities 
 * @param configuration 
 * @returns 
 */
export function entitiesToApplicationProfile(
  modelContainers: ModelContainer[],
  configuration: EntitiesToApplicationProfileConfiguration | null,
): DataSpecification[] {
  if (configuration === null) {
    configuration = defaultConfiguration();
  }
  // Build map to get information about re-use.
  const entityIdentifierToModelIdentifier: Record<string, string> = {};
  for (const { identifier, entities } of modelContainers) {
    for (const entity of entities) {
      entityIdentifierToModelIdentifier[entity.id] = identifier;
    }
  }
  // Build map of data specification IRI.
  const modelIdentifierToIri: Record<string, string> = {};
  for (const { identifier } of modelContainers) {
    modelIdentifierToIri[identifier] = configuration.modelIdentifierToConceptualModelIri(identifier);
  }
  // Build entity map for entities.
  const entityIdentifierToEntity: Record<string, Entity> = {};
  for (const { entities } of modelContainers) {
    for (const entity of entities) {
      entityIdentifierToEntity[entity.id] = entity;
    }
  }
  // Build data specification for each model.
  const dataSpecifications: DataSpecification[] = []
  for (const { identifier, alias, entities } of modelContainers) {
    // Data specification
    const modelBaseIri = "identifier:";
    const dataSpecification = createDataSpecification(
      configuration.modelIdentifierToSpecificationIri(identifier),
      alias);
    dataSpecifications.push(dataSpecification);

    //
    // Vocabulary
    const classes = entities.filter(isSemanticModelClass).map((item: SemanticModelClass) => ({
      iri: item.iri ?? (modelBaseIri + item.id),
    } as ConceptualClass));

    const relationships = entities.filter(isSemanticModelRelationshipWrap).map((item: SemanticModelRelationship) => ({
      iri: item.ends[1]?.iri,
      label: configuration.languageFilter(item.ends[1]?.name),
      domainIri: item.ends[0]?.concept,
      rangeIri: item.ends[1]?.concept,
    } as ConceptualRelationship));

    const attributes = entities.filter(isSemanticModelAttribute).map((item: SemanticModelRelationship) => ({
      iri: item.ends[1]?.iri,

    } as ConceptualAttribute));

    entities.filter(isSemanticModelGeneralization).forEach((item: any) => {
      // TODO Process generalizations.
      // console.log("Generalization was ignored.", {
      //   child: item.child,
      //   parent: item.parent,
      // });
    });

    if (classes.length > 0 || relationships.length > 0 || attributes.length > 0) {
      const vocabulary = extendToVocabulary(dataSpecification);
      vocabulary.classes = classes;
      vocabulary.properties = [...attributes, ...relationships];
    }

    //
    // Profile
    const classUsagesMap: Record<string, ClassProfile> = {};
    entities.filter(isSemanticModelClassUsage).forEach((item: SemanticModelClassUsage) => {
      const classProfile: ClassProfile = {
        // Profile
        iri: item.iri ?? "",
        prefLabel: {},
        usageNote: configuration.languageFilter(item.usageNote),
        defaultTechnicalLabel: null,
        profileOfIri: null,
        specializesProfileIri: null,
        // ClassProfile
        $type: [ClassProfileType],
        profiledClassIri: null,
        properties: [],
      }
      // For profile of we need to check what we are profiling.
      // It can be either a Profile or ConceptualClass.
      const profileOf = entityIdentifierToEntity[item.usageOf];
      if (profileOf === undefined) {
        console.error(`Missing profileOf for '${item.usageOf}' for '${item.id}'.`);
      } else {
        if (isSemanticModelClass(profileOf)) {
          classProfile.profiledClassIri = profileOf.iri;
        } else if (isSemanticModelClassUsage(profileOf)) {
          classProfile.profileOfIri = profileOf.iri;
        } else {
          console.warn(`Invalid profileOf for '${item.usageOf}' type '${profileOf.type}' for '${item.id}'.`)
        }
      }
      classUsagesMap[item.id] = classProfile;
    })

    entities.filter(isSemanticModelRelationshipUsage).forEach(item => {
      const [domain, range] = item.ends;
      if (domain === undefined || range === undefined) {
        console.error(`Expected two ends for '${item.id}'.`);
        return;
      }
      if (domain.concept === null) {
        console.error(`Missing 'ends[0].concept' for '${item.id}'.`);
        return;
      }
      const propertyProfile: PropertyProfile = {
        // Profile
        iri: range.iri ?? "",
        prefLabel: configuration.languageFilter(range.name),
        usageNote: configuration.languageFilter(range.usageNote),
        defaultTechnicalLabel: null,
        profileOfIri: null,
        specializesProfileIri: null,
        // PropertyProfile
        profiledPropertyIri: null,
        requiredVocabulary: [],
        additionalVocabulary: [],
      };
      if (isSemanticModelAttributeUsage(item)) {
        const attribute = extentToDatatypePropertyProfile(propertyProfile);
        if (range.concept !== null) {
          attribute.rangeDataTypeIri.push(range.concept);
        }
      } else {
        const association = extentToObjectPropertyProfile(propertyProfile);
        if (range.concept !== null) {
          const entity = entityIdentifierToEntity[range.concept] ?? null;
          if (isSemanticModelClassUsage(entity) && entity.iri) {
            association.rangeClassIri.push(entity.iri ?? ""); // TODO Use default
          }
        }
      }
      const owner = classUsagesMap[domain.concept];
      if (owner === undefined) {
        // TODO Is this possible and how we should handle it?
        console.warn("Missing owner usage for '${item.id}'.");
      }
      owner?.properties.push(propertyProfile);
    });

    const classUsages = Object.values(classUsagesMap);
    if (classUsages.length > 0) {
      const dataProfile = extendToDataProfile(
        dataSpecification,
        configuration.modelIdentifierToConceptualModelIri(identifier),
      );
      dataProfile.model.profiles = [
        ...classUsages,
      ];
    }
  }
  return dataSpecifications;
}

function defaultConfiguration(): EntitiesToApplicationProfileConfiguration {
  return {
    modelIdentifierToSpecificationIri: (identifier) => `http://example.com/${identifier}`,
    modelIdentifierToConceptualModelIri: (identifier) => `http://example.com/${identifier}/model`,
    languageFilter: (value: LanguageString | null | undefined): LanguageString | null => {
      if (value === null || value === undefined || value.cs === undefined) {
        return null;
      }
      return {
        cs: value["cs"],
      };
    }
  }
}

function createDataSpecification(iri: string, title: string): DataSpecification {
  return {
    iri,
    previousVersionIri: null, // TODO From configuration.
    reUsedSpecificationIri: [], // TODO We need to get this information from the entities.
    controlledVocabulary: [], // TODO We need to get this information from the entities.
    // As of now we have no way how to get this information.
    dataStructure: [],
    // As of now we have no way how to get this information.
    artefact: [],
  }
}

function extendToVocabulary(specification: DataSpecification): Vocabulary {
  (specification as any).classes = [];
  (specification as any).properties = [];
  (specification as any).$type = (specification as any).$type ?? [];
  (specification as any).$type.push(VocabularyType);
  return specification as Vocabulary;
}

function extendToDataProfile(specification: DataSpecification, conceptualModelIri: string): ApplicationProfile {
  const model: ConceptualModel = {
    iri: conceptualModelIri,
    profiles: [], // TODO
  };
  (specification as any).model = model;
  (specification as any).applicationProfileOfIri = [];
  (specification as any).$type = (specification as any).$type ?? [];
  (specification as any).$type.push(ApplicationProfileType);
  return specification as ApplicationProfile;
}

function extentToDatatypePropertyProfile(property: PropertyProfile): DatatypePropertyProfile {
  (property as any).$type = DatatypePropertyProfileType;
  (property as any).rangeDataTypeIri = [];
  return property as DatatypePropertyProfile;
}

function extentToObjectPropertyProfile(property: PropertyProfile): ObjectPropertyProfile {
  (property as any).$type = ObjectPropertyProfileType;
  (property as any).rangeClassIri = [];
  return property as ObjectPropertyProfile;
}
