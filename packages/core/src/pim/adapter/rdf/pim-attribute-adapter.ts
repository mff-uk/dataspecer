import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf/index.ts";
import { PimAttribute } from "../../model/index.ts";
import { loadPimResource } from "./pim-resource-adapter.ts";
import * as PIM from "../../pim-vocabulary.ts";

export class PimAttributeAdapter implements RdfResourceLoader {
  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PIM.ATTRIBUTE);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new PimAttribute(source.iri);
    result.pimDatatype = await source.node(PIM.HAS_DATA_TYPE);
    result.pimOwnerClass = await source.node(PIM.HAS_CLASS);
    return {
      resource: result,
      references: [
        ...(await loadPimResource(source, result)),
        ...result.pimDatatype,
      ],
    };
  }
}
