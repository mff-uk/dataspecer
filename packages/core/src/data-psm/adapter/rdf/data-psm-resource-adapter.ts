import { RdfSourceWrap } from "../../../core/adapter/rdf/index.ts";
import { DataPsmResource } from "../../model/index.ts";
import * as PSM from "../../data-psm-vocabulary.ts";

export async function loadDataPsmResource(
  source: RdfSourceWrap,
  dataPsmResource: DataPsmResource
): Promise<string[]> {
  dataPsmResource.dataPsmHumanLabel = await source.languageString(
    PSM.HAS_HUMAN_LABEL
  );
  dataPsmResource.dataPsmHumanDescription = await source.languageString(
    PSM.HAS_HUMAN_DESCRIPTION
  );
  dataPsmResource.dataPsmInterpretation = await source.node(
    PSM.HAS_INTERPRETATION
  );
  dataPsmResource.dataPsmTechnicalLabel = (
    await source.literal(PSM.HAS_TECHNICAL_LABEL)
  )?.value as string;
  return [dataPsmResource.dataPsmInterpretation];
}
