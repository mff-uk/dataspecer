import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf";
import {PimAssociationEnd} from "../../model";
import {loadPimResource} from "./pim-resource-adapter";
import * as PIM from "./pim-vocabulary";

export class PimAssociationEndAdapter implements RdfResourceLoader {

  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PIM.ASSOCIATION_END);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new PimAssociationEnd(source.iri);
    result.pimPart = await source.node(PIM.HAS_PARTICIPANT);
    return {
      "resource": result,
      "references": [
        ...await loadPimResource(source, result),
        ...result.pimPart,
      ],
    };
  }

}
