import { Entity } from "../../entity-model";
import {
  ApplicationProfile,
  ClassProfile,
  ConceptualModel,
  RdfsClass,
} from "./model";
import { SemanticModelClass, isSemanticModelClass } from "../concepts";
import {
  SemanticModelClassUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
} from "../usage/concepts";

type SemanticClassToIri = (entity: SemanticModelClass) => string;

type SemanticClassUsageToIri = (profile: SemanticModelClassUsage) => string;

interface EntitiesToApplicationProfileConfiguration {
  profileIri: string;
  classToIri: SemanticClassToIri;
  profileClassToIri: SemanticClassUsageToIri;
}

/**
 * This function is not ready! It is just a proof-of-concept converting
 * list of entities into data specification vocabulary.
 * 
 * 
 * @param entities 
 * @param configuration 
 * @returns 
 */
export function entitiesToApplicationProfile(
  entities: Entity[],
  configuration: EntitiesToApplicationProfileConfiguration | null,
): ApplicationProfile {
  if (configuration === null) {
    configuration = defaultConfiguration();
  }
  //
  const adapter = new EntitiesToApplicationProfile(configuration);
  adapter.addEntities(entities);
  //
  const profileClasses = entities.filter(isSemanticModelClassUsage);
  const profileProperties = entities.filter(isSemanticModelRelationshipUsage);
  //
  const conceptualModel: ConceptualModel = {
    "iri": "http://example.com/model",
    "classes": profileClasses.map(item => adapter.asClassProfile(item)),
  };
  return {
    "iri": configuration.profileIri,
    "previousVersion": null,
    "reUsedSpecification": [],
    "controlledVocabulary": [],
    "dataStructure": [],
    "artefact": [],
    "conceptualModel": [conceptualModel],
  };
}

function defaultConfiguration(): EntitiesToApplicationProfileConfiguration {
  const prefix = "http://example.com/"
  return {
    "profileIri": prefix + "profile",
    "classToIri": (semanticClass) =>
      semanticClass.iri ?? (prefix + semanticClass.id),
    "profileClassToIri": (profile) =>
      prefix + profile.id,
  }
}

class EntitiesToApplicationProfile {

  rdfsClasses: Map<string, RdfsClass> = new Map();

  classToIri: SemanticClassToIri;

  profileClassToIri: SemanticClassUsageToIri;

  constructor(configuration: EntitiesToApplicationProfileConfiguration,) {
    this.classToIri = configuration.classToIri;
    this.profileClassToIri = configuration.profileClassToIri;
  }

  addEntities(entities: Entity[]) {
    entities.filter(isSemanticModelClass).forEach(semanticClass => {
      this.rdfsClasses.set(semanticClass.id, {
        "iri": this.classToIri(semanticClass),
      });
    });
  }

  asClassProfile(profile: SemanticModelClassUsage): ClassProfile {
    const profiledClass = this.rdfsClasses.get(profile.usageOf);
    return {
      "iri": this.profileClassToIri(profile),
      "profileOf": null,
      "profiledClass": profiledClass ?? null,
      "specializes": null,
    };
  }

}



