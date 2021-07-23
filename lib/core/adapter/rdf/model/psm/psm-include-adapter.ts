import {RdfSourceWrap} from "../../rdf-source-wrap"
import {RdfResourceAdapter} from "../../rdf-adapter-api";
import {CoreResource, PsmInclude} from "../../../../model";
import {loadPsmResource} from "./psm-resource-adapter";
import * as PSM from "./psm-vocabulary";

export class PsmIncludeAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.INCLUDES)) {
      return [];
    }
    //
    const psmInclude: PsmInclude = PsmInclude.as(resource);
    const loadFromPim = await loadPsmResource(source, PsmInclude);
    //
    psmInclude.psmParts = await source.nodesExtended(PSM.HAS_PART);
    return [...loadFromPim, ...psmInclude.psmParts];
  }

}
