import {RdfSourceWrap} from "../../rdf-source-wrap"
import {RdfResourceAdapter} from "../../rdf-adapter-api";
import {CoreResource, PimClass} from "../../../../model";
import {loadPimResource} from "./pim-resource-adapter";
import * as PIM from "./pim-vocabulary";

export class PimClassAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PIM.CLASS)) {
      return [];
    }
    //
    const pimClass: PimClass = PimClass.as(resource);
    const loadFromPim = await loadPimResource(source, pimClass);
    //
    pimClass.pimExtends = await source.nodesExtended(PIM.HAS_ISA)
    return [...loadFromPim, ...pimClass.pimExtends];
  }

}
