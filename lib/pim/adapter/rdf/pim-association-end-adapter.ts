import {RdfSourceWrap, RdfResourceLoader} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {PimAssociationEnd, asPimAssociationEnd} from "../../model";
import {loadPimResource} from "./pim-resource-adapter";
import * as PIM from "./pim-vocabulary";

export class PimAssociationEndAdapter implements RdfResourceLoader {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource,
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PIM.ASSOCIATION_END)) {
      return [];
    }
    //
    const pimAssociation: PimAssociationEnd = asPimAssociationEnd(resource);
    const loadFromPim = await loadPimResource(source, pimAssociation);
    //
    pimAssociation.pimPart = await source.node(PIM.HAS_PARTICIPANT);
    return [...loadFromPim, pimAssociation.pimPart];
  }

}
