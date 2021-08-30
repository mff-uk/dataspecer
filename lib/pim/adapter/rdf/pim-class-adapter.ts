import {RdfSourceWrap, RdfResourceLoader} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {PimClass, asPimClass} from "../../model";
import {loadPimResource} from "./pim-resource-adapter";
import * as PIM from "./pim-vocabulary";

export class PimClassAdapter implements RdfResourceLoader {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource,
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PIM.CLASS)) {
      return [];
    }
    //
    const pimClass: PimClass = asPimClass(resource);
    const loadFromPim = await loadPimResource(source, pimClass);
    //
    pimClass.pimExtends = await source.nodesExtended(PIM.HAS_ISA);
    return [...loadFromPim, ...pimClass.pimExtends];
  }

}
