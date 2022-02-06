import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf";
import { DataPsmClass } from "../../model";
import { loadDataPsmResource } from "./data-psm-resource-adapter";
import * as PSM from "../../data-psm-vocabulary";

export class DataPsmClassAdapter implements RdfResourceLoader {
  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PSM.CLASS);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const resource = new DataPsmClass();
    resource.iri = source.iri;
    resource.dataPsmExtends = await source.nodesExtended(PSM.HAS_EXTENDS);
    resource.dataPsmParts = await source.nodesExtended(PSM.HAS_PART);
    return {
      resource: resource,
      references: [
        ...(await loadDataPsmResource(source, resource)),
        ...resource.dataPsmParts,
        ...resource.dataPsmExtends,
      ],
    };
  }
}
