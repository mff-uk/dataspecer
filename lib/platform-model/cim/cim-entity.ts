import {
  ModelResource, LanguageString, ModelLoader,
} from "../platform-model-api";
import * as CIM from "./cim-vocabulary";
import {EntitySource} from "../../rdf/entity-source";

export class CimEntity extends ModelResource {

  static readonly TYPE: string = "cim-entity";

  cimHumanLabel?: LanguageString;

  cimHumanDescription?: LanguageString;

  static is(resource: ModelResource): resource is CimEntity {
    return resource.types.includes(CimEntity.TYPE);
  }

  static as(resource: ModelResource): CimEntity {
    if (CimEntity.is(resource)) {
      return resource as CimEntity;
    }
    resource.types.push(CimEntity.TYPE);
    return resource as CimEntity;
  }

}

export class CimEntityAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    // TODO Consider http://www.w3.org/2004/02/skos/core#Concept
    return true;
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource
  ): Promise<string[]> {
    const cimEntity = CimEntity.as(resource);
    cimEntity.cimHumanLabel =
      await source.languageString(CIM.HAS_HUMAN_LABEL);
    cimEntity.cimHumanDescription =
      await source.languageString(CIM.HAS_HUMAN_DESCRIPTION);
    return [];
  }

}
