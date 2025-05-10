import { wrapWithColorGenerator } from "./color-generator-wrap.ts";
import { DefaultVisualModel } from "./default-visual-model.ts";
import { createDefaultEntityModel } from "./entity-model/default-entity-model.ts";
import { MODEL_VISUAL_TYPE } from "./visual-entity.ts";
import { SynchronousUnderlyingVisualModel, WritableVisualModel } from "./visual-model.ts";

export interface VisualModelFactory {

  /**
   * Temporary method till the internal entity model is aligned with
   * the external one.
   *
   * @deprecated Use other method instead.
   */
  createNewWritableVisualModelSync(): WritableVisualModel;

  /**
   * Create default visual model by wrapping other model.
   */
  createWritableVisualModelSync(
    model: SynchronousUnderlyingVisualModel,
  ): WritableVisualModel;

}

class DefaultVisualModelFactory implements VisualModelFactory {

  createNewWritableVisualModelSync() {
    const identifier = createIdentifier();
    const internal = createDefaultEntityModel(MODEL_VISUAL_TYPE, identifier);
    return this.createWritableVisualModelSync(internal);
  }

  createWritableVisualModelSync(
    model: SynchronousUnderlyingVisualModel,
  ): WritableVisualModel {
    return wrapWithColorGenerator(new DefaultVisualModel(model));
  }

}

const createIdentifier = () => (Math.random() + 1).toString(36).substring(7);

const factory = new DefaultVisualModelFactory();

export function createDefaultVisualModelFactory() {
  return factory;
}
