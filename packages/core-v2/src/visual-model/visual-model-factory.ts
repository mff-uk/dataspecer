import { DefaultVisualModel } from "./default-visual-model";
import { OnPremiseUnderlyingVisualModel, VisualModel } from "./visual-model";

export interface VisualModelFactory {

  createVisualModel(model: OnPremiseUnderlyingVisualModel): Promise<VisualModel | null>;

}

class DefaultVisualModelFactory implements VisualModelFactory {

  async createVisualModel(model: OnPremiseUnderlyingVisualModel): Promise<VisualModel | null> {
    return new DefaultVisualModel(model);
  }

}

const factory = new DefaultVisualModelFactory();

export function createDefaultVisualModelFactory() {
  return factory;
}
