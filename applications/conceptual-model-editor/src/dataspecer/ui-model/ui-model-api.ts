import { HexColor } from "@dataspecer/core-v2/visual-model";
import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";
import { UiEntity, UiReference } from "./model";
import { UiModelState } from "./ui-model-state";

export interface UiModelApi {

  getEntity(reference: UiReference): UiEntity | null;

  getEntityByIdentifier(identifier: EntityDsIdentifier): UiEntity | null;

  getSemanticModelColor(identifier: ModelDsIdentifier): HexColor;

}

export function wrapUiModelStateToUiModelApi(
  state: UiModelState,
  defaultModelColor: string,
): UiModelApi {
  const entitiesMap: Record<string, UiEntity[]> = {};
  return {
    getEntity(reference) {
      const entities = entitiesMap[reference.identifier];
      return entities.find(item => item.model === reference.model) ?? null;
    },
    getEntityByIdentifier(identifier) {
      const entities = entitiesMap[identifier];
      return entities?.[0] ?? null;
    },
    getSemanticModelColor(identifier) {
      const model = state.semanticModels.find(model => model.identifier === identifier);
      return model?.displayColor ?? defaultModelColor;
    },
  }
}
