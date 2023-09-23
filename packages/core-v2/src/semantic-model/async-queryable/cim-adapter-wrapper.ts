import {CimAdapter} from "@dataspecer/core/cim/cim-adapter";
import {CoreResource, CoreResourceReader} from "@dataspecer/core/core";
import {PimAssociation, PimAssociationEnd, PimAttribute, PimClass} from "@dataspecer/core/pim/model";
import {SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship} from "../concepts/concepts";
import {AsyncQueryableEntityModel, AsyncQueryableObservableEntityModel} from "../../entity-model/async-queryable/model";
import {Entities} from "../../entity-model/entity";
import {SearchQueryEntity} from "./queries";


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

function transformPimClass(cls: PimClass) {
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

function transformCoreResourceReader(reader: CoreResourceReader) {
    let result: Entities = {};

    const syncReader = reader as unknown as { resources: { [iri: string]: CoreResource } };

    // Transform classes
    for (const resource of Object.values(syncReader.resources)) {
        if (PimClass.is(resource)) {
            // Merge transform pim class into result
            result = {...result, ...transformPimClass(resource)};
        }
        if (PimAssociation.is(resource)) {
            const left = syncReader.resources[resource.pimEnd[0]] as PimAssociationEnd;
            const right = syncReader.resources[resource.pimEnd[1]] as PimAssociationEnd;
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

/**
 * Adapter from {@link CimAdapter} from core version 1 to the {@link AsyncQueryableObservableEntityModel} from core version 2.
 */
export class CimAdapterWrapper implements AsyncQueryableEntityModel {
    private cimAdapter: CimAdapter;

    constructor(cimAdapter: CimAdapter) {
        this.cimAdapter = cimAdapter;
    }

    async query(queryIri: string): Promise<Entities> {
        if (queryIri.startsWith("surroundings:")) {
            const iri = queryIri.substring("surroundings:".length);
            const reader = await this.cimAdapter.getSurroundings(iri);
            return  transformCoreResourceReader(reader);
        }
        if (queryIri.startsWith("search:")) {
            const searchQuery = queryIri.substring("search:".length);
            const result = await this.cimAdapter.search(searchQuery);
            const searchResult = {
                iri: queryIri,
                type: ["search-results"],
                order: result.map(cls => cls.iri),
            } as SearchQueryEntity;
            return {
                [queryIri]: searchResult,
                ...Object.fromEntries(result.map(r => [r.iri, r])),
            }
        }
        if (queryIri.startsWith("class:")) {
            const iri = queryIri.substring("class:".length);
            const pimClass = await this.cimAdapter.getClass(iri);
            if (pimClass) {
                return transformPimClass(pimClass);
            } else {
                return {};
            }
        }
        throw new Error(`Query ${queryIri} is not supported.`);
    }
}
