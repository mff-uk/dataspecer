import {RdfSourceWrap} from "../rdf-source-wrap"
import {RdfResourceAdapter} from "../rdf-adapter-api";
import {CoreResource, PimAttribute} from "../../../model";
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
    const pimAttribute: PimAttribute = PimAttribute.as(resource);
    const loadFromPim = await loadPimResource(source, pimAttribute);
    //
    pimAttribute.pimDatatype = await source.node(PIM.HAS_DATA_TYPE);
    pimAttribute.pimOwnerClass = await source.node(PIM.HAS_CLASS);
    return [...loadFromPim, ...pimAttribute.pimDatatype];
  }

}
