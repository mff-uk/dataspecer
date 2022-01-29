import {PimAssociationEnd, PimAttribute} from "@model-driven-data/core/pim/model";

export function getCardinalityFromResource(resource: PimAttribute | PimAssociationEnd): string {
    return `[${resource.pimCardinalityMin ?? "0"}..${resource.pimCardinalityMax ?? "*"}]`;
}
