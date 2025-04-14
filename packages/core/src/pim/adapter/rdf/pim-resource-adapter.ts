import { RdfSourceWrap } from "../../../core/adapter/rdf/index.ts";
import { PimResource } from "../../model/index.ts";
import * as PIM from "../../pim-vocabulary.ts";

export async function loadPimResource(
  source: RdfSourceWrap,
  pimResource: PimResource
): Promise<string[]> {
  pimResource.pimInterpretation = await source.node(PIM.HAS_INTERPRETATION);
  pimResource.pimTechnicalLabel = (
    await source.literal(PIM.HAS_TECHNICAL_LABEL)
  )?.value as string;
  pimResource.pimHumanLabel = await source.languageString(PIM.HAS_HUMAN_LABEL);
  pimResource.pimHumanDescription = await source.languageString(
    PIM.HAS_HUMAN_DESCRIPTION
  );
  return [pimResource.pimInterpretation];
}
