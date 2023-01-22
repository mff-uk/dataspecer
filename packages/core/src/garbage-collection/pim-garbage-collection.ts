import {CoreResourceReader, CoreResourceWriter} from "../core";
import {
    DataPsmAssociationEnd,
    DataPsmAttribute,
    DataPsmClass,
    DataPsmClassReference,
    DataPsmExternalRoot,
    DataPsmInclude,
    DataPsmOr,
    DataPsmSchema
} from "../data-psm/model";
import * as PSM from "../data-psm/data-psm-vocabulary";
import * as PIM from "../pim/pim-vocabulary";
import {PimAssociation, PimAssociationEnd, PimAttribute, PimClass, PimSchema} from "../pim/model";
import {PimDeleteAssociation, PimDeleteAttribute, PimDeleteClass, PimSetExtends} from "../pim/operation";

// todo use memory store withou async
async function getOwningPsmClass(store: CoreResourceReader, entityIri: string): Promise<DataPsmClass | null> {
    const entities = await store.listResourcesOfType(PSM.CLASS);
    for (const entity of entities) {
        const entityClass = await store.readResource(entity) as DataPsmClass;
        if (entityClass.dataPsmParts.includes(entityIri)) {
            return entityClass;
        }
    }

    return null;
}

async function getOwningPimAssociationForEnd(store: CoreResourceReader, associationEndIri: string): Promise<PimAssociation | null> {
    const entities = await store.listResourcesOfType(PIM.ASSOCIATION);
    for (const entity of entities) {
        const association = await store.readResource(entity) as PimAssociation;
        if (association.pimEnd.includes(associationEndIri)) {
            return association;
        }
    }

    return null;
}

/**
 * Returns null or [descendant, ..., ..., ancestor]
 */
async function getPimInheritanceChain(store: CoreResourceReader, descendant: string, ancestor: string): Promise<string[] | null> {
    async function recursive(entity: string, chain: string[] = []): Promise<string[] | null> {
        chain.push(entity);

        if (entity === ancestor) {
            return chain; // success
        }

        const entityClass = await store.readResource(entity) as PimClass;

        for (const parent of entityClass.pimExtends) {
            if (chain.includes(parent)) {
                continue; // cycle
            }
            const result = await recursive(parent, chain);
            if (result !== null) {
                return result;
            }
        }

        chain.pop();
        return null;
    }

    return recursive(descendant);
}

interface GarbageCollectionReport {
    removedClasses: number;
    removedEntities: number;
}

/**
 * Removes all entities from a PIM schema that are not necessary for given PSM schemas.
 */
export async function pimGarbageCollection(
    pim: CoreResourceReader & CoreResourceWriter,
    dataPsms: CoreResourceReader[],
): Promise<GarbageCollectionReport> {
    // todo: create commit

    // PIM resource IRIs that shall be kept
    const keep = new Set<string>();

    // Traverse PSM schemas and find all PIM resources that are referenced and shall be kept
    for (const dataPsm of dataPsms) {
        const dataPsmSchemaIri = (await dataPsm.listResourcesOfType(PSM.SCHEMA))[0];
        const schema = await dataPsm.readResource(dataPsmSchemaIri) as DataPsmSchema;
        if (schema === null) {
            throw new Error(`PSM schema ${dataPsmSchemaIri} not found.`);
        }
        const parts = schema.dataPsmParts;
        for (const part of parts) {
            const entity = await dataPsm.readResource(part);
            if (entity === null) {
                throw new Error(`Entity ${part} not found, but was referenced from its schema ${dataPsmSchemaIri}.`);
            }

            if (DataPsmClass.is(entity)) {
                if (entity.dataPsmInterpretation) {
                    keep.add(entity.dataPsmInterpretation);
                }
            } else if (DataPsmAttribute.is(entity)) {
                if (entity.dataPsmInterpretation) {
                    keep.add(entity.dataPsmInterpretation);
                    const pimAttribute = await pim.readResource(entity.dataPsmInterpretation) as PimAttribute;
                    const cls = await getOwningPsmClass(dataPsm, entity.iri);
                    const chain = await getPimInheritanceChain(pim, cls.dataPsmInterpretation, pimAttribute.pimOwnerClass);
                    chain.forEach(i => keep.add(i));
                }
            } else if (DataPsmAssociationEnd.is(entity)) {
                if (entity.dataPsmInterpretation) {
                    const pimAssociation = await getOwningPimAssociationForEnd(pim, entity.dataPsmInterpretation);
                    const pimEnds = await Promise.all(pimAssociation.pimEnd.map(i => pim.readResource(i) as Promise<PimAssociationEnd>));
                    keep.add(pimAssociation.iri); // Association itself
                    pimEnds.forEach(i => keep.add(i.iri)); // With association ends
                    pimEnds.forEach(i => keep.add(i.pimPart)); // With associated classes

                    const domainPimEnd = pimEnds.find(i => i.iri !== entity.dataPsmInterpretation);
                    const rangePimEnd = pimEnds.find(i => i.iri === entity.dataPsmInterpretation);

                    const psmRange = await dataPsm.readResource(entity.dataPsmPart);
                    const psmDomain = await getOwningPsmClass(dataPsm, entity.iri);

                    const domainChain = await getPimInheritanceChain(pim, psmDomain.dataPsmInterpretation, domainPimEnd.pimPart);
                    domainChain.forEach(i => keep.add(i));

                    if (DataPsmClass.is(psmRange)) {
                        const rangeChain = await getPimInheritanceChain(pim, psmRange.dataPsmInterpretation, rangePimEnd.pimPart);
                        rangeChain.forEach(i => keep.add(i));
                    }
                    // todo implement other entities
                }
            } else if (DataPsmInclude.is(entity)) {
                // pass
            } else if (DataPsmClassReference.is(entity)) {
                // pass
            } else if (DataPsmExternalRoot.is(entity)) {
                entity.dataPsmTypes.forEach(i => keep.add(i));
            } else if (DataPsmOr.is(entity)) {
                throw new Error(`GC not implemented for OR constructs yet.`);
            } else {
                throw new Error(`Unknown entity ${entity.iri} type.`);
            }
        }
    }

    const pimSchemaIri = (await pim.listResourcesOfType(PIM.SCHEMA))[0];
    const pimSchema = await pim.readResource(pimSchemaIri) as PimSchema;
    let removedEntities = 0;

    const pimParts = [...pimSchema.pimParts];

    // Attributes
    for (const entityIri of pimParts) {
        const entity = await pim.readResource(entityIri);
        if (!entity || !PimAttribute.is(entity)) {
            continue;
        }

        if (!keep.has(entity.iri)) {
            const op = new PimDeleteAttribute();
            op.pimAttribute = entity.iri;
            await pim.applyOperation(op);
            removedEntities++;
        }
    }

    // Associations (and trivially association ends)
    for (const entityIri of pimParts) {
        const entity = await pim.readResource(entityIri);
        if (!entity || !PimAssociation.is(entity)) {
            continue;
        }

        if (!keep.has(entity.iri)) {
            const op = new PimDeleteAssociation();
            op.pimAssociation = entity.iri;
            await pim.applyOperation(op);
            removedEntities += 3; // Association and two ends
        }
    }

    // Class inheritance
    for (const entityIri of pimParts) {
        const entity = await pim.readResource(entityIri);
        if (!entity || !PimClass.is(entity)) {
            continue;
        }

        const newExtends = entity.pimExtends.filter(i => keep.has(i));

        if (newExtends.length !== entity.pimExtends.length) {
            const op = new PimSetExtends();
            op.pimResource = entity.iri;
            op.pimExtends = newExtends;
            await pim.applyOperation(op);
        }
    }

    // Classes
    let removedClasses = 0;
    for (const entityIri of pimParts) {
        const entity = await pim.readResource(entityIri);
        if (!entity || !PimClass.is(entity)) {
            continue;
        }

        if (!keep.has(entity.iri)) {
            const op = new PimDeleteClass();
            op.pimClass = entity.iri;
            await pim.applyOperation(op);
            removedClasses++;
            removedEntities++;
        }
    }

    return {removedClasses, removedEntities};
}
