import {RdfSourceWrap} from "../../../core/adapter/rdf";
import {DataPsmResource} from "../../model";
import * as PSM from "./data-psm-vocabulary";

export async function loadDataPsmResource(
  source: RdfSourceWrap, dataPsmResource: DataPsmResource
): Promise<string[]> {
  dataPsmResource.dataPsmInterpretation =
    (await source.node(PSM.HAS_INTERPRETATION))?.id;
  dataPsmResource.dataPsmTechnicalLabel =
    (await source.literal(PSM.HAS_TECHNICAL_LABEL))?.value as string;
  dataPsmResource.dataPsmHumanLabel =
    await source.languageString(PSM.HAS_HUMAN_LABEL);
  dataPsmResource.dataPsmHumanDescription =
    await source.languageString(PSM.HAS_HUMAN_DESCRIPTION);
  return [dataPsmResource.dataPsmInterpretation];
}
