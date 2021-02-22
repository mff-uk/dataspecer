import {ModelResource, ModelLoader} from "../platform-model-api";
import {PsmBase, loadPsmBaseIntoResource} from "./psm-base";
import {EntitySource} from "../../rdf/entity-source";
import * as PSM from "./psm-vocabulary";

export class PsmClass extends PsmBase {

  static readonly TYPE: string = "psm-class";

  psmExtends: string[] = [];

  psmParts: string[] = [];

  ownerSchema?: string;

  static is(resource: ModelResource): resource is PsmClass {
    return resource.types.includes(PsmClass.TYPE);
  }

  static as(resource: ModelResource): PsmClass {
    if (PsmClass.is(resource)) {
      return resource as PsmClass;
    }
    resource.types.push(PsmClass.TYPE);
    const result = resource as PsmClass;
    result.psmExtends = result.psmExtends || [];
    result.psmParts = result.psmParts || [];
    return result;
  }

}

export class PsmClassAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    return resource.rdfTypes.includes(PSM.CLASS);
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource
  ): Promise<string[]> {
    const loadFromBase = await loadPsmBaseIntoResource(source, resource);
    const psmClass = PsmClass.as(resource);
    psmClass.psmExtends = await source.irisExtended(PSM.HAS_EXTENDS);
    psmClass.psmParts = await source.irisExtended(PSM.HAS_PART);
    psmClass.ownerSchema = (await source.reverseEntity(PSM.HAS_ROOT))?.id;
    return [
      ...loadFromBase, ...psmClass.psmExtends, ...psmClass.psmParts,
      psmClass.ownerSchema,
    ];
  }

}
