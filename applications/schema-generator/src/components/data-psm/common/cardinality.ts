import {PimAssociationEnd, PimAttribute} from "@model-driven-data/core/pim/model";

export function getCardinalityFromResource(resource: PimAttribute | PimAssociationEnd): string {
    if ((resource.pimCardinalityMin === 0 || resource.pimCardinalityMin === null) && resource.pimCardinalityMax === null) {
        return "";
    } else {
        return `[${resource.pimCardinalityMin ?? ""}..${resource.pimCardinalityMax ?? "*"}]`;
    }
}
