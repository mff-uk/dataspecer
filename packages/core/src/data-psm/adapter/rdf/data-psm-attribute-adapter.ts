import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf";
import { DataPsmAttribute } from "../../model";
import { loadDataPsmResource } from "./data-psm-resource-adapter";
import * as PSM from "../../data-psm-vocabulary";

export class DataPsmAttributeAdapter implements RdfResourceLoader {
  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PSM.ATTRIBUTE);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new DataPsmAttribute(source.iri);
    result.dataPsmDatatype = await source.node(PSM.HAS_DATA_TYPE);
    return {
      resource: result,
      references: [
        ...(await loadDataPsmResource(source, result)),
        result.dataPsmDatatype,
      ],
    };
  }
}
