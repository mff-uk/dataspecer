import {PimAssociationEnd, PimAttribute} from "@dataspecer/core/pim/model";

export function getCardinalityFromResource(resource: PimAttribute | PimAssociationEnd): string {
    return `[${resource.pimCardinalityMin ?? "0"}..${resource.pimCardinalityMax ?? "*"}]`;
}
