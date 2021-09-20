import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf";
import {DataPsmPropertyContainer} from "../../model";
import * as PSM from "./data-psm-vocabulary";

export class PsmIncludeAdapter implements RdfResourceLoader {

  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PSM.PROPERTY_CONTAINER);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new DataPsmPropertyContainer(source.iri);
    result.dataPsmParts = await source.nodesExtended(PSM.HAS_PART);
    return {
      "resource": result,
      "references": [
        ...result.dataPsmParts,
      ],
    };
  }

}
