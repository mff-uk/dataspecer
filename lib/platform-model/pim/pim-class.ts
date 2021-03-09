import {ModelResource, ModelLoader} from "../platform-model-api";
import {loadPimBaseIntoResource, PimBase} from "./pim-base";
import * as PIM from "./pim-vocabulary";
import {EntitySource} from "../../rdf/entity-source";

export class PimClass extends PimBase {

  static readonly TYPE: string = "pim-class";

  /**
   * For each class there should be only one schema owner.
   */
  ownerSchema?: string;

  pimIsa: string[] = [];

  static is(resource: ModelResource): resource is PimClass {
    return resource.types.includes(PimClass.TYPE);
  }

  static as(resource: ModelResource): PimClass {
    if (PimClass.is(resource)) {
      return resource as PimClass;
    }
    resource.types.push(PimClass.TYPE);
    const result = resource as PimClass;
    result.pimIsa = result.pimIsa || [];
    return result;
  }

}

export class PimClassAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    return resource.rdfTypes.includes(PIM.CLASS);
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource,
  ): Promise<string[]> {
    const loadFromBase = await loadPimBaseIntoResource(source, resource);
    const pimClass = PimClass.as(resource);
    pimClass.pimIsa = await source.irisExtended(PIM.HAS_ISA);
    pimClass.ownerSchema = (await source.reverseEntity(PIM.HAS_PART))?.id;
    return [...loadFromBase, ...pimClass.pimIsa, pimClass.ownerSchema];
  }

}
