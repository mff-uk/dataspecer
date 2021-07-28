import {RdfSourceWrap, RdfResourceAdapter} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {asDataPsmPropertyContainer} from "../../model";
import * as PSM from "./data-psm-vocabulary";

export class PsmIncludeAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.PROPERTY_CONTAINER)) {
      return [];
    }
    //
    const result = asDataPsmPropertyContainer(resource);
    //
    result.dataPsmHumanLabel =
      await source.languageString(PSM.HAS_HUMAN_LABEL);
    result.dataPsmHumanDescription =
      await source.languageString(PSM.HAS_HUMAN_DESCRIPTION);
    result.dataPsmParts = await source.nodesExtended(PSM.HAS_PART);
    return [...result.dataPsmParts];
  }

}
