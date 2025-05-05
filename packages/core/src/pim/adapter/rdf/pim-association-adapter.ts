import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf/index.ts";
import { PimAssociation } from "../../model/index.ts";
import { loadPimResource } from "./pim-resource-adapter.ts";
import * as PIM from "../../pim-vocabulary.ts";

export class PimAssociationAdapter implements RdfResourceLoader {
  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PIM.ASSOCIATION);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new PimAssociation(source.iri);
    result.pimEnd = await source.nodesExtended(PIM.HAS_END);
    return {
      resource: result,
      references: [
        ...(await loadPimResource(source, result)),
        ...result.pimEnd,
      ],
    };
  }
}
