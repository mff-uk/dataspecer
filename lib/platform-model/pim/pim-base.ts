import {ModelResource, LanguageString} from "../platform-model-api";
import {EntitySource} from "../../rdf/entity-source";
import * as PIM from "./pim-vocabulary";

export class PimBase extends ModelResource {

  pimInterpretation?: string;

  pimTechnicalLabel?: string;

  pimHumanLabel?: LanguageString;

  pimHumanDescription?: LanguageString;

  /**
   * Class this property belongs to.
   */
  pimHasClass?: string;

}

export async function loadPimBaseIntoResource(
  source: EntitySource, pimBase: PimBase,
): Promise<string[]> {
  pimBase.pimInterpretation =
    (await source.entity(PIM.HAS_INTERPRETATION))?.id;
  pimBase.pimTechnicalLabel =
    (await source.literal(PIM.HAS_TECHNICAL_LABEL))?.value as string;
  pimBase.pimHumanLabel =
    await source.languageString(PIM.HAS_HUMAN_LABEL);
  pimBase.pimHumanDescription =
    await source.languageString(PIM.HAS_HUMAN_DESCRIPTION);
  pimBase.pimHasClass = (await source.entity(PIM.HAS_CLASS))?.id;
  return [pimBase.pimInterpretation, pimBase.pimHasClass];
}
