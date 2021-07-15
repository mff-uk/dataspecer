import {RdfSourceWrap} from "../rdf-source-wrap"
import {RdfResourceAdapter} from "../rdf-adapter-api";
import {CoreResource, PsmAttribute} from "../../../model";
import {loadPsmResource} from "./psm-resource-adapter";
import * as PSM from "./psm-vocabulary";

export class PsmAttributeAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.ATTRIBUTE)) {
      return [];
    }
    //
    const psmAttribute: PsmAttribute = PsmAttribute.as(resource);
    const loadFromPim = await loadPsmResource(source, PsmAttribute);
    //
    psmAttribute.psmDatatype = await source.node(PSM.HAS_DATA_TYPE);
    return [...loadFromPim, ...psmAttribute.psmDatatype];
  }

}
