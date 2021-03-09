import {
  ModelResource, LanguageString, ModelLoader,
} from "../platform-model-api";
import * as PIM from "./pim-vocabulary";
import {EntitySource} from "../../rdf/entity-source";

export class PimSchema extends ModelResource {

  static readonly TYPE: string = "pim-schema";

  pimHumanLabel: LanguageString = {};

  pimHumanDescription: LanguageString = {};

  pimParts: string[] = [];

  static is(resource: ModelResource): resource is PimSchema {
    return resource.types.includes(PimSchema.TYPE);
  }

  static as(resource: ModelResource): PimSchema {
    if (PimSchema.is(resource)) {
      return resource as PimSchema;
    }
    resource.types.push(PimSchema.TYPE);
    const result = resource as PimSchema;
    result.pimHumanLabel = result.pimHumanLabel || {};
    result.pimHumanDescription = result.pimHumanDescription || {};
    result.pimParts = result.pimParts || [];
    return result;
  }

}

export class PimSchemaAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    return resource.rdfTypes.includes(PIM.SCHEMA);
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource,
  ): Promise<string[]> {
    const pimSchema = PimSchema.as(resource);
    pimSchema.pimHumanLabel =
      await source.languageString(PIM.HAS_HUMAN_LABEL);
    pimSchema.pimHumanDescription =
      await source.languageString(PIM.HAS_HUMAN_DESCRIPTION);
    pimSchema.pimParts =
      await source.irisExtended(PIM.HAS_PART);
    return [...pimSchema.pimParts];
  }

}
