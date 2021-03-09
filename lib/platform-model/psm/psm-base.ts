import {ModelResource, LanguageString} from "../platform-model-api";
import {EntitySource} from "../../rdf/entity-source";
import * as PSM from "./psm-vocabulary";

export class PsmBase extends ModelResource {

  psmInterpretation?: string;

  /**
   * This can be only a single language string.
   */
  psmTechnicalLabel?: string;

  psmHumanLabel?: LanguageString;

  psmHumanDescription?: LanguageString;

}

export async function loadPsmBaseIntoResource(
  source: EntitySource, psmBase: PsmBase,
): Promise<string[]> {
  psmBase.psmInterpretation =
    (await source.entity(PSM.HAS_INTERPRETATION))?.id;
  psmBase.psmTechnicalLabel =
    (await source.literal(PSM.HAS_TECHNICAL_LABEL))?.value as string;
  psmBase.psmHumanLabel =
    await source.languageString(PSM.HAS_HUMAN_LABEL);
  psmBase.psmHumanDescription =
    await source.languageString(PSM.HAS_HUMAN_DESCRIPTION);
  return [psmBase.psmInterpretation];
}
