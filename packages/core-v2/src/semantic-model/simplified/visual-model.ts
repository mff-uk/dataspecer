import { VisualEntityModel, VisualEntityModelImpl } from "../../visual-model";

export const createVisualModel = (modelId: string) => {
    const model = new VisualEntityModelImpl(modelId);
    return model as VisualEntityModel;
};
