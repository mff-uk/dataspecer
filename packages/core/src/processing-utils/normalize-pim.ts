import { CoreResource } from "../core";
import { DataPsmResource } from "../data-psm/model";
import { PimAssociation, PimAssociationEnd, PimAttribute, PimClass, PimResource, PimSchema } from "../pim/model";

export type NormalizePimResult = {
    removedResourcesCount: number;
}

/**
 * Removes duplicates on PIM level.
 */
export function normalizePim(pimStore: { [iri: string]: CoreResource }, psmStores: { [iri: string]: CoreResource }[]) {
    // Mapping from old resource to new
    const pimMapping = new Map<string, string>();
    
    const finalPimResources: PimResource[] = [];
    // Make PIM resources unique
    for (const current of Object.values(pimStore) as PimResource[]) {
        const same = finalPimResources.find(res => res.pimInterpretation === current.pimInterpretation);
        if (current.pimInterpretation && same) {
            // There is already a resource with the same interpretation
            pimMapping.set(current.iri, same.iri);
            // Todo merge
        } else {
            finalPimResources.push(current);
        }
    }

    // Process PIM ends
    for (const [from, to] of pimMapping.entries()) {
        if (PimAssociation.is(pimStore[to])) {
            const toAssociation = pimStore[to] as PimAssociation;
            const fromAssociation = pimStore[from] as PimAssociation;

            pimMapping.set(fromAssociation.pimEnd[0], toAssociation.pimEnd[0]);
            pimMapping.set(fromAssociation.pimEnd[1], toAssociation.pimEnd[1]);
        }
    }

    // Remove PIM resources that are duplicates
    for (const [pimIri, keptPimIri] of pimMapping.entries()) {
        delete pimStore[pimIri];
    }

    // Fix links on PIM level
    for (const current of Object.values(pimStore) as PimResource[]) {
        if (PimClass.is(current)) {
            current.pimExtends = [...new Set(current.pimExtends.map(value => pimMapping.get(value) ?? value))];
        } else if (PimAttribute.is(current)) {
            current.pimOwnerClass = pimMapping.get(current.pimOwnerClass) ?? current.pimOwnerClass;
        } else if (PimAssociation.is(current)) {
            current.pimEnd = current.pimEnd.map(end => pimMapping.get(end) ?? end);
        } else if (PimAssociationEnd.is(current)) {
            current.pimPart = pimMapping.get(current.pimPart) ?? current.pimPart;
        } else if (PimSchema.is(current)) {
            // Just remove those with mapping, because the image is already there
            current.pimParts = current.pimParts.filter(part => !pimMapping.has(part));
        } else {
            throw new Error("Unknown PIM resource type");
        }
    }

    // Fix interpretation links on PSM level
    for (const psmStore of psmStores) {
        const psmResources = Object.values(psmStore) as DataPsmResource[];
        for (const current of psmResources) {
            current.dataPsmInterpretation = pimMapping.get(current.dataPsmInterpretation) ?? current.dataPsmInterpretation;
        }
    }

    return {
        removedResourcesCount: pimMapping.size,
    };
}