import {RdfSourceWrap} from "../rdf-source-wrap"
import {RdfResourceAdapter} from "../rdf-adapter-api";
import {CoreResource, PsmChoice} from "../../../model";
import {loadPsmResource} from "./psm-resource-adapter";
import * as PSM from "./psm-vocabulary";

export class PsmChoiceAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.CHOICE)) {
      return [];
    }
    //
    const psmAttribute: PsmChoice = PsmChoice.as(resource);
    const loadFromPim = await loadPsmResource(source, PsmChoice);
    //
    psmAttribute.psmParts = await source.nodesExtended(PSM.HAS_PART);
    return [...loadFromPim, ...psmAttribute.psmParts];
  }

}
