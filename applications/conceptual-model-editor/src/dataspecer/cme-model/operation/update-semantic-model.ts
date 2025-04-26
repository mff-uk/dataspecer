import { CmeSemanticModelChange, CmeSemanticModelNameLanguage } from "../model";
import { SemanticModel } from "../../semantic-model";
import { isInMemorySemanticModel } from "@/utilities/model";

/**
 * @throws DataspecerError
 */
export function updateCmeSemanticModel(
  model: SemanticModel,
  next: CmeSemanticModelChange,
) {
  model.setAlias(next.name[CmeSemanticModelNameLanguage]);
  if (isInMemorySemanticModel(model)) {
    model.setBaseIri(next.baseIri ?? "");
  }
}
