import {RdfSourceWrap} from "../../rdf-source-wrap"
import {RdfResourceAdapter} from "../../rdf-adapter-api";
import {CoreResource, PimAssociationEnd} from "../../../../model";
import {loadPimResource} from "./pim-resource-adapter";
import * as PIM from "./pim-vocabulary";

export class PimAssociationEndAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PIM.ASSOCIATION_END)) {
      return [];
    }
    //
    const pimAssociation: PimAssociationEnd = PimAssociationEnd.as(resource);
    const loadFromPim = await loadPimResource(source, pimAssociation);
    //
    pimAssociation.pimPart = await source.node(PIM.HAS_PARTICIPANT);
    return [...loadFromPim, pimAssociation.pimPart];
  }

}
