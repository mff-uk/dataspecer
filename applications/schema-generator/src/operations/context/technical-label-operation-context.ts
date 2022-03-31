import {PimResource} from "@model-driven-data/core/pim/model";

export interface TechnicalLabelOperationContext {
    getTechnicalLabelFromPim(pimResource: PimResource): string | null;
}
