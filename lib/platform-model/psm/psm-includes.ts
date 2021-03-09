import {ModelResource, ModelLoader} from "../platform-model-api";
import {EntitySource} from "../../rdf/entity-source";
import * as PSM from "./psm-vocabulary";

export class PsmIncludes extends ModelResource {

  static readonly TYPE: string = "psm-includes";

  psmIncludes: string[] = [];

  static is(resource: ModelResource): resource is PsmIncludes {
    return resource.types.includes(PsmIncludes.TYPE);
  }

  static as(resource: ModelResource): PsmIncludes {
    if (PsmIncludes.is(resource)) {
      return resource as PsmIncludes;
    }
    resource.types.push(PsmIncludes.TYPE);
    const result = resource as PsmIncludes;
    result.psmIncludes = result.psmIncludes || [];
    return result;
  }

}

export class PsmIncludesAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    return resource.rdfTypes.includes(PSM.INCLUDES);
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource,
  ): Promise<string[]> {
    const psmIncludes = PsmIncludes.as(resource);
    psmIncludes.psmIncludes = await source.irisExtended(PSM.HAS_INCLUDES);
    return [...psmIncludes.psmIncludes];
  }

}
