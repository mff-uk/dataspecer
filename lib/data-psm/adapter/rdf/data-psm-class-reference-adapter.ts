import {RdfSourceWrap, RdfResourceAdapter} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {asDataPsmClassReference} from "../../model";
import * as PSM from "./data-psm-vocabulary";

export class PsmClassAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource,
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.CLASS_REFERENCE)) {
      return [];
    }
    //
    const result = asDataPsmClassReference(resource);
    //
    result.dataPsmRefersTo = await source.node(PSM.HAS_REFERS_TO);
    result.dataPsmSchema = await source.node(PSM.HAS_SCHEMA);
    return [result.dataPsmRefersTo, result.dataPsmSchema];
  }

}
