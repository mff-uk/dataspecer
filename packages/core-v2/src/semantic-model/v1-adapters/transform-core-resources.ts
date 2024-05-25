import { SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship } from "../concepts";
import { Entities } from "../../entity-model";
import { PimAssociation, PimAssociationEnd, PimAttribute, PimClass } from "@dataspecer/core/pim/model";
import { CoreResource } from "@dataspecer/core/core";
import { SemanticModelEntity } from "../concepts/concepts";

const GENERALIZATION_PREFIX = "https://dataspecer.com/semantic-models/generalization";

function getGeneralizationIri(fromIri: string, toIri: string): string {
    const url = new URLSearchParams({ fromIri, toIri });
    return GENERALIZATION_PREFIX + url.toString();
}

function createGeneralization(fromIri: string, toIri: string): SemanticModelGeneralization {
    return {
        id: getGeneralizationIri(fromIri, toIri),
        iri: null,
        type: ["generalization"],
        child: fromIri,
        parent: toIri,
    };
}

export function transformPimClass(cls: PimClass) {
    const result: Record<string, SemanticModelEntity> = {};

    result[cls.iri as string] = {
        id: cls.iri!,
        iri: cls.pimInterpretation ?? null,
        name: cls.pimHumanLabel ?? {},
        description: cls.pimHumanDescription ?? {},
        type: ["class"],
    } as SemanticModelClass;

    cls.pimExtends
        .map((to) => createGeneralization(cls.iri as string, to))
        .forEach((generalization) => (result[generalization.id] = generalization));

    return result;
}

export function transformCoreResources(resources: Record<string, CoreResource>) {
    let result: Entities = {};

    // Transform classes
    for (const resource of Object.values(resources)) {
        if (PimClass.is(resource)) {
            // Merge transform pim class into result
            result = { ...result, ...transformPimClass(resource) };
        }
        if (PimAssociation.is(resource)) {
            const left = resources[resource.pimEnd[0]!] as PimAssociationEnd;
            const right = resources[resource.pimEnd[1]!] as PimAssociationEnd;
            const association = {
                id: resource.iri as string,
                iri: null,
                type: ["relationship"],
                name: resource.pimHumanLabel ?? {},
                description: resource.pimHumanDescription ?? {},
                ends: [
                    {
                        cardinality: [left.pimCardinalityMin ?? 0, left.pimCardinalityMax],
                        name: left.pimHumanLabel ?? {},
                        description: left.pimHumanDescription ?? {},
                        concept: left.pimPart,
                    },
                    {
                        cardinality: [right.pimCardinalityMin ?? 0, right.pimCardinalityMax],
                        name: right.pimHumanLabel ?? resource.pimHumanLabel ?? {},
                        description: right.pimHumanDescription ?? resource.pimHumanDescription ?? {},
                        concept: right.pimPart,
                        iri: resource.pimInterpretation ?? null,
                    },
                ],
            } as SemanticModelRelationship;

            result[association.id] = association;
        }
        if (PimAttribute.is(resource)) {
            const attribute = {
                id: resource.iri as string,
                iri: null,
                type: ["relationship"],
                name: {},
                description: {},
                ends: [
                    {
                        cardinality: [0, null],
                        name: {},
                        description: {},
                        concept: resource.pimOwnerClass as string,
                    },
                    {
                        cardinality: [resource.pimCardinalityMin ?? 0, resource.pimCardinalityMax],
                        name: resource.pimHumanLabel ?? {},
                        description: resource.pimHumanDescription ?? {},
                        concept: resource.pimDatatype,
                        iri: resource.pimInterpretation ?? null,
                    },
                ],
            } as SemanticModelRelationship;

            result[attribute.id] = attribute;
        }
    }

    return result;
}
