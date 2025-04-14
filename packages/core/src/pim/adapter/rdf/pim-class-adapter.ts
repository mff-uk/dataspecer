import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf/index.ts";
import { PimClass } from "../../model/index.ts";
import { loadPimResource } from "./pim-resource-adapter.ts";
import * as PIM from "../../pim-vocabulary.ts";

export class PimClassAdapter implements RdfResourceLoader {
  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PIM.CLASS);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new PimClass(source.iri);
    result.pimExtends = await source.nodesExtended(PIM.HAS_ISA);
    return {
      resource: result,
      references: [
        ...(await loadPimResource(source, result)),
        ...result.pimExtends,
      ],
    };
  }
}
