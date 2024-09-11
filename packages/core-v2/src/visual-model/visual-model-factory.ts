import { DefaultVisualModel } from "./default-visual-model";
import { SynchronousUnderlyingVisualModel, WritableVisualModel } from "./visual-model";

export interface VisualModelFactory {

  createWritableVisualModelSync(model: SynchronousUnderlyingVisualModel): WritableVisualModel;

}

class DefaultVisualModelFactory implements VisualModelFactory {

  createWritableVisualModelSync(model: SynchronousUnderlyingVisualModel): WritableVisualModel {
    return new DefaultVisualModel(model);
  }

}

const factory = new DefaultVisualModelFactory();

export function createDefaultVisualModelFactory() {
  return factory;
}
