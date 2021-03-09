import {ModelResource, ModelLoader} from "../platform-model-api";
import {PsmBase, loadPsmBaseIntoResource} from "./psm-base";
import {EntitySource} from "../../rdf/entity-source";
import * as PSM from "./psm-vocabulary";

export class PsmAttribute extends PsmBase {

  static readonly TYPE: string = "psm-attribute";

  psmParts: string[] = [];

  static is(resource: ModelResource): resource is PsmAttribute {
    return resource.types.includes(PsmAttribute.TYPE);
  }

  static as(resource: ModelResource): PsmAttribute {
    if (PsmAttribute.is(resource)) {
      return resource as PsmAttribute;
    }
    resource.types.push(PsmAttribute.TYPE);
    const result = resource as PsmAttribute;
    result.psmParts = result.psmParts || [];
    return result;
  }

}

export class PsmAttributeAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    return resource.rdfTypes.includes(PSM.ATTRIBUTE);
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource,
  ): Promise<string[]> {
    const loadFromBase = await loadPsmBaseIntoResource(source, resource);
    const psmAttribute = PsmAttribute.as(resource);
    psmAttribute.psmParts = await source.irisExtended(PSM.HAS_PART);
    return [...loadFromBase, ...psmAttribute.psmParts];
  }

}
