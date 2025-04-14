import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf/index.ts";
import { PimAssociationEnd } from "../../model/index.ts";
import { loadPimResource } from "./pim-resource-adapter.ts";
import * as PIM from "../../pim-vocabulary.ts";

export class PimAssociationEndAdapter implements RdfResourceLoader {
  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PIM.ASSOCIATION_END);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new PimAssociationEnd(source.iri);
    result.pimPart = await source.node(PIM.HAS_PARTICIPANT);
    return {
      resource: result,
      references: [
        ...(await loadPimResource(source, result)),
        ...result.pimPart,
      ],
    };
  }
}
