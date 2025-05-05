import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf/index.ts";
import { DataPsmAssociationEnd } from "../../model/index.ts";
import { loadDataPsmResource } from "./data-psm-resource-adapter.ts";
import * as PSM from "../../data-psm-vocabulary.ts";

export class DataPsmAssociationEndAdapter implements RdfResourceLoader {
  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PSM.ASSOCIATION_END);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new DataPsmAssociationEnd(source.iri);
    result.dataPsmPart = await source.node(PSM.HAS_PARTICIPANT);
    return {
      resource: result,
      references: [
        ...(await loadDataPsmResource(source, result)),
        result.dataPsmPart,
      ],
    };
  }
}
