import {RdfSourceWrap} from "../../rdf-source-wrap"
import {RdfResourceAdapter} from "../../rdf-adapter-api";
import {CoreResource, PsmAssociationEnd} from "../../../../model";
import {loadPsmResource} from "./psm-resource-adapter";
import * as PSM from "./psm-vocabulary";

export class PsmAssociationEndAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.ASSOCIATION_END)) {
      return [];
    }
    //
    const psmAssociation: PsmAssociationEnd = PsmAssociationEnd.as(resource);
    const loadFromPim = await loadPsmResource(source, psmAssociation);
    //
    psmAssociation.psmPart = await source.node(PSM.HAS_PARTICIPANT);
    return [...loadFromPim, psmAssociation.psmPart];
  }

}
