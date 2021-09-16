import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf";
import { DataPsmSchema} from "../../model";
import * as PSM from "./data-psm-vocabulary";

export class DataPsmSchemaAdapter implements RdfResourceLoader {

  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PSM.SCHEMA);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new DataPsmSchema(source.iri);
    result.dataPsmTechnicalLabel =
      (await source.literal(PSM.HAS_TECHNICAL_LABEL))?.value as string;
    result.dataPsmHumanLabel =
      await source.languageString(PSM.HAS_HUMAN_LABEL);
    result.dataPsmHumanDescription =
      await source.languageString(PSM.HAS_HUMAN_DESCRIPTION);
    result.dataPsmRoots = await source.nodesExtended(PSM.HAS_ROOT);
    result.dataPsmParts = await source.nodesExtended(PSM.HAS_PART);
    return {
      "resource": result,
      "references": [
        // One should be enough, this is just to be safe.
        ...result.dataPsmParts, ...result.dataPsmRoots,
      ],
    };
  }

}
