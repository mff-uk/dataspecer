import {SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship} from "../concepts";
import {Entities} from "../../entity-model";
import {PimAssociation, PimAssociationEnd, PimAttribute, PimClass } from "@dataspecer/core/pim/model";
import { CoreResource } from "@dataspecer/core/core";

const GENERALIZATION_PREFIX = "https://dataspecer.com/semantic-models/generalization";

function getGeneralizationIri(fromIri: string, toIri: string): string {
    const url = new URLSearchParams({fromIri, toIri});
    return GENERALIZATION_PREFIX + url.toString();
}

function createGeneralization(fromIri: string, toIri: string): SemanticModelGeneralization {
    return {
        iri: getGeneralizationIri(fromIri, toIri),
        type: ["generalization"],
        child: fromIri,
        parent: toIri,
    }
}

export function transformPimClass(cls: PimClass) {
    const result: Entities = {};

    result[cls.iri as string] = {
        iri: cls.iri,
        name: cls.pimHumanLabel ?? {},
        description: cls.pimHumanDescription ?? {},
        type: ["class"],
    } as SemanticModelClass;

    cls.pimExtends
        .map(to => createGeneralization(cls.iri as string, to))
        .forEach(generalization => result[generalization.iri] = generalization);

    return result;
}

export function transformCoreResources(resources: Record<string, CoreResource>) {
    let result: Entities = {};

    // Transform classes
    for (const resource of Object.values(resources)) {
        if (PimClass.is(resource)) {
            // Merge transform pim class into result
            result = {...result, ...transformPimClass(resource)};
        }
        if (PimAssociation.is(resource)) {
            const left = resources[resource.pimEnd[0]] as PimAssociationEnd;
            const right = resources[resource.pimEnd[1]] as PimAssociationEnd;
            const association = {
                iri: resource.iri as string,
                type: ["relationship"],
                name: resource.pimHumanLabel ?? {},
                description: resource.pimHumanDescription ?? {},
                ends: [
                    {
                        cardinality: [left.pimCardinalityMin, left.pimCardinalityMax],
                        name: left.pimHumanLabel ?? {},
                        description: left.pimHumanDescription ?? {},
                        concept: left.pimPart,
                    },
                    {
                        cardinality: [right.pimCardinalityMin, right.pimCardinalityMax],
                        name: right.pimHumanLabel ?? {},
                        description: right.pimHumanDescription ?? {},
                        concept: right.pimPart,
                    }
                ]
            } as SemanticModelRelationship;

            result[association.iri] = association;
        }
        if (PimAttribute.is(resource)) {
            const attribute = {
                iri: resource.iri as string,
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
                        cardinality: [resource.pimCardinalityMin, resource.pimCardinalityMax],
                        name: resource.pimHumanLabel ?? {},
                        description: resource.pimHumanDescription ?? {},
                        concept: resource.pimDatatype,
                    }
                ]
            } as SemanticModelRelationship;

            result[attribute.iri] = attribute;
        }
    }

    return result;
}