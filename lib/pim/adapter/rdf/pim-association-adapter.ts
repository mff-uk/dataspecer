import {RdfSourceWrap, RdfResourceLoader} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {PimAssociation, asPimAssociation} from "../../model";
import {loadPimResource} from "./pim-resource-adapter";
import * as PIM from "./pim-vocabulary";

export class PimAssociationAdapter implements RdfResourceLoader {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource,
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PIM.ASSOCIATION)) {
      return [];
    }
    //
    const pimAssociation: PimAssociation = asPimAssociation(resource);
    const loadFromPim = await loadPimResource(source, pimAssociation);
    //
    pimAssociation.pimEnd = await source.nodesExtended(PIM.HAS_END);
    return [...loadFromPim, ...pimAssociation.pimEnd];
  }

}
