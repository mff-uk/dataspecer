import {ModelResource, ModelLoader} from "../platform-model-api";
import {PimBase, loadPimBaseIntoResource} from "./pim-base";
import * as PIM from "./pim-vocabulary";
import {EntitySource} from "../../rdf/entity-source";

export class PimAttribute extends PimBase {

  static readonly TYPE: string = "pim-attribute";

  pimDatatype?: string;

  static is(resource: ModelResource): resource is PimAttribute {
    return resource.types.includes(PimAttribute.TYPE);
  }

  static as(resource: ModelResource): PimAttribute {
    if (PimAttribute.is(resource)) {
      return resource as PimAttribute;
    }
    resource.types.push(PimAttribute.TYPE);
    return resource as PimAttribute;
  }

}

export class PimAttributeAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    return resource.rdfTypes.includes(PIM.ATTRIBUTE);
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource,
  ): Promise<string[]> {
    const loadFromBase = await loadPimBaseIntoResource(source, resource);
    const pimAttribute = PimAttribute.as(resource);
    pimAttribute.pimDatatype = (await source.entity(PIM.HAS_DATA_TYPE))?.id;
    return [...loadFromBase, pimAttribute.pimDatatype];
  }

}
