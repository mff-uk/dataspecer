import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf";
import {DataPsmClassReference} from "../../model";
import * as PSM from "./data-psm-vocabulary";

export class PsmClassAdapter implements RdfResourceLoader {

  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PSM.CLASS_REFERENCE);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new DataPsmClassReference(source.iri);
    result.dataPsmRefersTo = await source.node(PSM.HAS_REFERS_TO);
    result.dataPsmSchema = await source.node(PSM.HAS_SCHEMA);
    return {
      "resource": result,
      // We do not load the other resources as they are in different schema.
      "references": [],
    };
  }

}
