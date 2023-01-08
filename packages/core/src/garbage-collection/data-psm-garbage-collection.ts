import {CoreResourceReader, CoreResourceWriter} from "../core";
import * as PSM from "../data-psm/data-psm-vocabulary";
import {
    DataPsmAssociationEnd,
    DataPsmAttribute,
    DataPsmClass,
    DataPsmClassReference, DataPsmExternalRoot, DataPsmInclude, DataPsmOr,
    DataPsmSchema
} from "../data-psm/model";
import {
    DataPsmDeleteAssociationEnd,
    DataPsmDeleteAttribute,
    DataPsmDeleteClass, DataPsmDeleteClassReference,
    DataPsmDeleteInclude, DataPsmDeleteOr
} from "../data-psm/operation";

interface DataPsmGarbageCollectionReport {
    deletedEntities: number;
}
export async function dataPsmGarbageCollection(
    dataPsm: CoreResourceReader & CoreResourceWriter
): Promise<DataPsmGarbageCollectionReport> {
    const schemaIri = (await dataPsm.listResourcesOfType(PSM.SCHEMA))[0];
    const schema = await dataPsm.readResource(schemaIri) as DataPsmSchema;
    const beginNoOfEntities = schema.dataPsmParts.length;

    const visited = new Set<string>();
    const toVisit = [...schema.dataPsmRoots];
    while (toVisit.length > 0) {
        const current = toVisit.pop();
        if (visited.has(current)) {
            continue;
        }
        visited.add(current);

        const entity = await dataPsm.readResource(current);

        if (DataPsmAssociationEnd.is(entity)) {
            toVisit.push(entity.dataPsmPart);
        } else if (DataPsmAttribute.is(entity)) {
            // pass
        } else if (DataPsmClass.is(entity)) {
            toVisit.push(...entity.dataPsmParts);
        } else if (DataPsmClassReference.is(entity)) {
            // pass
        } else if (DataPsmExternalRoot.is(entity)) {
            // pass
        } else if (DataPsmInclude.is(entity)) {
            toVisit.push(entity.dataPsmIncludes);
        } else if (DataPsmOr.is(entity)) {
            toVisit.push(...entity.dataPsmChoices);
        } else {
            throw new Error("Unknown entity type");
        }
    }

    // It shall be sufficient to delete only classes with all their parts
    for (const entityIri of schema.dataPsmParts) {
        const entity = await dataPsm.readResource(entityIri);
        if (DataPsmClass.is(entity) && !visited.has(entityIri)) {
            console.log(`Deleting PSM class ${entity.dataPsmTechnicalLabel}.`);
            // First, delete all parts
            for (const partIri of entity.dataPsmParts) {
                const part = await dataPsm.readResource(partIri);
                if (DataPsmAttribute.is(part)) {
                    const op = new DataPsmDeleteAttribute();
                    op.dataPsmAttribute = partIri;
                    op.dataPsmOwner = entityIri;
                    await dataPsm.applyOperation(op);
                } else if (DataPsmAssociationEnd.is(part)) {
                    const op = new DataPsmDeleteAssociationEnd();
                    op.dataPsmAssociationEnd = partIri;
                    op.dataPsmOwner = entityIri;
                    await dataPsm.applyOperation(op);
                } else if (DataPsmInclude.is(part)) {
                    const op = new DataPsmDeleteInclude();
                    op.dataPsmInclude = partIri;
                    op.dataPsmOwner = entityIri;
                    await dataPsm.applyOperation(op);
                } else {
                    throw new Error("Unknown entity type");
                }
            }
            // Then, delete the class itself
            const op = new DataPsmDeleteClass();
            op.dataPsmClass = entityIri;
            await dataPsm.applyOperation(op);
        }
        if (DataPsmClassReference.is(entity) && !visited.has(entityIri)) {
            const op = new DataPsmDeleteClassReference();
            op.dataPsmClassReference = entityIri;
            await dataPsm.applyOperation(op);
        }
        if (DataPsmOr.is(entity) && !visited.has(entityIri)) {
            const op = new DataPsmDeleteOr();
            op.dataPsmOr = entityIri;
            await dataPsm.applyOperation(op);
        }
    }

    const updatedSchema = await dataPsm.readResource(schemaIri) as DataPsmSchema;

    return {
        deletedEntities: beginNoOfEntities - updatedSchema.dataPsmParts.length,
    }
}
