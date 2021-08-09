import {RdfSourceWrap, RdfResourceAdapter} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {asDataPsmAssociationEnd} from "../../model";
import {loadDataPsmResource} from "./data-psm-resource-adapter";
import * as PSM from "./data-psm-vocabulary";

export class DataPsmAssociationEndAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource,
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.ASSOCIATION_END)) {
      return [];
    }
    //
    const result = asDataPsmAssociationEnd(resource);
    const loadFromPim = await loadDataPsmResource(source, result);
    //
    result.dataPsmPart = await source.node(PSM.HAS_PARTICIPANT);
    return [...loadFromPim, result.dataPsmPart];
  }

}
