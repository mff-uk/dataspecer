import {
  ModelResource, LanguageString, ModelLoader,
} from "../platform-model-api";
import {EntitySource} from "../../rdf/entity-source";
import * as PSM from "./psm-vocabulary";

export class PsmSchema extends ModelResource {

  static readonly TYPE: string = "psm-schema";

  psmHumanLabel?: LanguageString;

  psmHumanDescription?: LanguageString;

  psmTechnicalLabel?: string;

  psmRoots: string[] = [];

  static is(resource: ModelResource): resource is PsmSchema {
    return resource.types.includes(PsmSchema.TYPE);
  }

  static as(resource: ModelResource): PsmSchema {
    if (PsmSchema.is(resource)) {
      return resource as PsmSchema;
    }
    resource.types.push(PsmSchema.TYPE);
    const result = resource as PsmSchema;
    result.psmHumanLabel = result.psmHumanLabel || {};
    result.psmRoots = result.psmRoots || [];
    return result;
  }

}

export class PsmSchemaAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    return resource.rdfTypes.includes(PSM.SCHEMA);
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource
  ): Promise<string[]> {
    const psmSchema = PsmSchema.as(resource);
    psmSchema.psmHumanLabel =
      await source.languageString(PSM.HAS_HUMAN_LABEL);
    psmSchema.psmHumanDescription =
      await source.languageString(PSM.HAS_HUMAN_DESCRIPTION);
    psmSchema.psmTechnicalLabel =
      (await source.literal(PSM.HAS_TECHNICAL_LABEL))?.value as string;
    psmSchema.psmRoots =
      await source.irisExtended(PSM.HAS_ROOT);
    return [...psmSchema.psmRoots];
  }

}
