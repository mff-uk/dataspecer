import {RdfSourceWrap} from "../../rdf-source-wrap"
import {RdfResourceAdapter} from "../../rdf-adapter-api";
import {CoreResource, PimAssociation} from "../../../../model";
import {loadPimResource} from "./pim-resource-adapter";
import * as PIM from "./pim-vocabulary";

export class PimAssociationAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PIM.ASSOCIATION)) {
      return [];
    }
    //
    const pimAssociation: PimAssociation = PimAssociation.as(resource);
    const loadFromPim = await loadPimResource(source, pimAssociation);
    //
    pimAssociation.pimEnd = await source.nodesExtended(PIM.HAS_END);
    pimAssociation.pimOwnerClass = await source.node(PIM.HAS_CLASS);
    return [...loadFromPim, ...pimAssociation.pimEnd];
  }

}
