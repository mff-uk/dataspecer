import {RdfSourceWrap, RdfResourceAdapter} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {asDataPsmInclude} from "../../model";
import {loadDataPsmResource} from "./data-psm-resource-adapter";
import * as PSM from "./data-psm-vocabulary";

export class DataPsmIncludeAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.INCLUDES)) {
      return [];
    }
    //
    const result = asDataPsmInclude(resource);
    const loadFromPim = await loadDataPsmResource(source, result);
    //
    result.dataPsmParts = await source.nodesExtended(PSM.HAS_PART);
    return [...loadFromPim, ...result.dataPsmParts];
  }

}
