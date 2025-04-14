import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf/index.ts";
import { DataPsmClassReference } from "../../model/index.ts";
import * as PSM from "../../data-psm-vocabulary.ts";

export class DataPsmClassReferenceAdapter implements RdfResourceLoader {
  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PSM.CLASS_REFERENCE);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new DataPsmClassReference(source.iri);
    result.dataPsmSpecification = await source.node(PSM.HAS_REFERS_TO);
    return {
      resource: result,
      // We do not load the other resources as they are in different schema.
      references: [],
    };
  }
}
