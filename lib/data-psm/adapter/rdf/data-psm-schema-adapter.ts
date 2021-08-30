import {RdfSourceWrap, RdfResourceLoader} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {asDataPsmSchema} from "../../model";
import * as PSM from "./data-psm-vocabulary";

export class DataPsmSchemaAdapter implements RdfResourceLoader {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource,
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.SCHEMA)) {
      return [];
    }
    //
    const result = asDataPsmSchema(resource);
    //
    result.dataPsmTechnicalLabel =
      (await source.literal(PSM.HAS_TECHNICAL_LABEL))?.value as string;
    result.dataPsmHumanLabel =
      await source.languageString(PSM.HAS_HUMAN_LABEL);
    result.dataPsmHumanDescription =
      await source.languageString(PSM.HAS_HUMAN_DESCRIPTION);
    result.dataPsmRoots = await source.nodesExtended(PSM.HAS_ROOT);
    result.dataPsmParts = await source.nodesExtended(PSM.HAS_PART);
    return [...result.dataPsmParts, ...result.dataPsmRoots];
  }

}
