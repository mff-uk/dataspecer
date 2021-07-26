import {RdfSourceWrap, RdfResourceAdapter} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {PimAttribute, asPimAttribute} from "../../model";
import {loadPimResource} from "./pim-resource-adapter";
import * as PIM from "./pim-vocabulary";

export class PimAttributeAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PIM.ATTRIBUTE)) {
      return [];
    }
    //
    const pimAttribute: PimAttribute = asPimAttribute(resource);
    const loadFromPim = await loadPimResource(source, pimAttribute);
    //
    pimAttribute.pimDatatype = await source.node(PIM.HAS_DATA_TYPE);
    pimAttribute.pimOwnerClass = await source.node(PIM.HAS_CLASS);
    return [...loadFromPim, ...pimAttribute.pimDatatype];
  }

}
