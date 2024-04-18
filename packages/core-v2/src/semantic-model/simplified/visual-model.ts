import { VisualEntityModel, VisualEntityModelImpl } from "../../visual-model";

export const createVisualModel = (iri: string) => {
    const model = new VisualEntityModelImpl(iri);
    return model as VisualEntityModel;
};
