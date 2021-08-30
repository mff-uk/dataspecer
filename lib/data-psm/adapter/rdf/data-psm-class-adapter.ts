import {RdfSourceWrap, RdfResourceLoader} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {asDataPsmClass} from "../../model";
import {loadDataPsmResource} from "./data-psm-resource-adapter";
import * as PSM from "./data-psm-vocabulary";

export class DataPsmClassAdapter implements RdfResourceLoader {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource,
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.CLASS)) {
      return [];
    }
    //
    const result = asDataPsmClass(resource);
    const loadFromPsm = await loadDataPsmResource(source, result);
    //
    result.dataPsmExtends = await source.nodesExtended(PSM.HAS_EXTENDS);
    result.dataPsmParts = await source.nodesExtended(PSM.HAS_PART);
    return [...loadFromPsm, ...result.dataPsmExtends, ...result.dataPsmParts];
  }

}
