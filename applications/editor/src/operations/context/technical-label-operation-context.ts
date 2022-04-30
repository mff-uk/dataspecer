import {PimResource} from "@dataspecer/core/pim/model";

export interface TechnicalLabelOperationContext {
    getTechnicalLabelFromPim(pimResource: PimResource): string | null;
}
