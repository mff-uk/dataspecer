import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf";
import {DataPsmInclude} from "../../model";
import * as PSM from "./data-psm-vocabulary";

export class DataPsmIncludeAdapter implements RdfResourceLoader {

  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PSM.INCLUDES);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new DataPsmInclude(source.iri);
    result.dataPsmParts = await source.nodesExtended(PSM.HAS_PART);
    return {
      "resource": result,
      "references": [
        ...result.dataPsmParts,
      ],
    };
  }

}
