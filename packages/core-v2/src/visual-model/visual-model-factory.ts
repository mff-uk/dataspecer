import { DefaultVisualModel } from "./default-visual-model";
import { createDefaultEntityModel } from "./entity-model/default-entity-model";
import { MODEL_VISUAL_TYPE } from "./visual-entity";
import { SynchronousUnderlyingVisualModel, WritableVisualModel } from "./visual-model";

export interface VisualModelFactory {

  /**
   * Temporary method till the internal entity model is aligned with the external one.
   *
   * @deprecated Use other method instead.
   */
  createNewWritableVisualModelSync(): WritableVisualModel;

  createWritableVisualModelSync(model: SynchronousUnderlyingVisualModel): WritableVisualModel;

}

class DefaultVisualModelFactory implements VisualModelFactory {

  createNewWritableVisualModelSync() {
    const identifier = createIdentifier();
    const internal = createDefaultEntityModel(MODEL_VISUAL_TYPE, identifier);
    return this.createWritableVisualModelSync(internal);
  }

  createWritableVisualModelSync(model: SynchronousUnderlyingVisualModel): WritableVisualModel {
    return new DefaultVisualModel(model);
  }

}

const createIdentifier = () => (Math.random() + 1).toString(36).substring(7);

const factory = new DefaultVisualModelFactory();

export function createDefaultVisualModelFactory() {
  return factory;
}
