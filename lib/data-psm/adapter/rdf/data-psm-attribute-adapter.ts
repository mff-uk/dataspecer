import {RdfSourceWrap, RdfResourceAdapter} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {asDataPsmAttribute} from "../../model";
import {loadDataPsmResource} from "./data-psm-resource-adapter";
import * as PSM from "./data-psm-vocabulary";

export class DataPsmAttributeAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource,
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.ATTRIBUTE)) {
      return [];
    }
    //
    const result = asDataPsmAttribute(resource);
    const loadFromPim = await loadDataPsmResource(source, result);
    //
    result.dataPsmDatatype = await source.node(PSM.HAS_DATA_TYPE);
    return [...loadFromPim, ...result.dataPsmDatatype];
  }

}
