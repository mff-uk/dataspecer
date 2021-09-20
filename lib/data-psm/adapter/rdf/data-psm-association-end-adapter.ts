import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf";
import {DataPsmAssociationEnd} from "../../model";
import {loadDataPsmResource} from "./data-psm-resource-adapter";
import * as PSM from "./data-psm-vocabulary";

export class DataPsmAssociationEndAdapter implements RdfResourceLoader {

  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PSM.ASSOCIATION_END);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new DataPsmAssociationEnd(source.iri);
    result.dataPsmPart = await source.node(PSM.HAS_PARTICIPANT);
    return {
      "resource": result,
      "references": [
        ...await loadDataPsmResource(source, result),
        result.dataPsmPart,
      ],
    };
  }

}
