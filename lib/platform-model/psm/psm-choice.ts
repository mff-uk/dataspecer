import {ModelResource, ModelLoader} from "../platform-model-api";
import {PsmBase, loadPsmBaseIntoResource} from "./psm-base";
import {EntitySource} from "../../rdf/entity-source";
import * as PSM from "./psm-vocabulary";

export class PsmChoice extends PsmBase {

  static readonly TYPE: string = "psm-choice";

  psmParts: string[] = [];

  static is(resource: ModelResource): resource is PsmChoice {
    return resource.types.includes(PsmChoice.TYPE);
  }

  static as(resource: ModelResource): PsmChoice {
    if (PsmChoice.is(resource)) {
      return resource as PsmChoice;
    }
    resource.types.push(PsmChoice.TYPE);
    const result = resource as PsmChoice;
    result.psmParts = result.psmParts || [];
    return result;
  }

}

export class PsmChoiceAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    return resource.rdfTypes.includes(PSM.CHOICE);
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource,
  ): Promise<string[]> {
    const loadFromBase = await loadPsmBaseIntoResource(source, resource);
    const psmChoice = PsmChoice.as(resource);
    psmChoice.psmParts = await source.irisExtended(PSM.HAS_PART);
    return [...loadFromBase, ...psmChoice.psmParts];
  }

}
