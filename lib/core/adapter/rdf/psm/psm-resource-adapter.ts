import {RdfSourceWrap} from "../rdf-source-wrap"
import {PsmResource} from "../../../model/psm/psm-resource";
import * as PSM from "./psm-vocabulary";

export async function loadPsmResource(
  source: RdfSourceWrap, psmResource: PsmResource
): Promise<string[]> {
  psmResource.psmInterpretation =
    (await source.node(PSM.HAS_INTERPRETATION))?.id;
  psmResource.psmTechnicalLabel =
    (await source.literal(PSM.HAS_TECHNICAL_LABEL))?.value as string;
  psmResource.psmHumanLabel =
    await source.languageString(PSM.HAS_HUMAN_LABEL);
  psmResource.psmHumanDescription =
    await source.languageString(PSM.HAS_HUMAN_DESCRIPTION);
  return [psmResource.psmInterpretation];
}
