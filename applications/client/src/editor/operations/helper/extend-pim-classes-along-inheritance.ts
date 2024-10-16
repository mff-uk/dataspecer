import { isSemanticModelGeneralization, SemanticModelClass, SemanticModelEntity } from '@dataspecer/core-v2/semantic-model/concepts';
import { PimClass } from "@dataspecer/core/pim/model";
import { PimSetExtends } from "@dataspecer/core/pim/operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { createPimClassIfMissing } from "./pim";

/**
 * Adds necessary PIM classes to the store, that there will be a path from
 * {@link fromClass} to {@link toClass}.
 * @param fromClass Local PIM class IRI that exists
 * @param toClass PIM IRI from the {@link sourcePimModel} that will be copied
 * @param pimSchema
 * @param store
 * @param sourcePimModel
 */
export async function extendPimClassesAlongInheritance(
    fromClass: SemanticModelClass, // This is the Semantic model class we want to go from
    toClass: SemanticModelClass,// This is the Semantic model class we want to go to
    pimSchema: string,
    store: FederatedObservableStore,
    sourcePimModel: SemanticModelEntity[], // This is the whole store
): Promise<boolean> {
    // Find all classes which needs to be created or checked in order from most generic to most specific.
    const classesToProcess: string[] = [];

    // DFS that finds a SINGLE (random, if multiple exists) path
    const traverseFunction = async (currentClass: SemanticModelClass, path: Set<string> = new Set()): Promise<boolean> => {
        let success = currentClass.id === toClass.id;

        if (currentClass !== toClass) {
            path.add(currentClass.id as string);
            const thisClassExtends = sourcePimModel.filter(isSemanticModelGeneralization).filter(g => g.child === currentClass.id).map(g => g.parent);
            for (const ext of thisClassExtends) {
                const extClass = sourcePimModel.find(e => e.id === ext) as SemanticModelClass;
                if (!extClass) {
                    continue;
                }
                if (path.has(extClass.iri as string)) {
                    continue
                }
                if (await traverseFunction(extClass, path)) {
                    success = true;
                    break;
                }
            }
            path.delete(currentClass.iri as string);
        }

        if (success) {
            classesToProcess.push(currentClass.iri as string);
        }
        return success;
    }

    const success = await traverseFunction(fromClass);

    // Create each class and fix its extends
    let parentLocalClassInChain: PimClass | null = null; // Patent of the current one but from the local store
    for (const classToProcessIri of classesToProcess) {
        const classToProcess = sourcePimModel.find(e => e.iri === classToProcessIri) as SemanticModelClass;

        const iri = await createPimClassIfMissing(classToProcess, pimSchema, store);
        const localClass = await store.readResource(iri) as PimClass;

        const missingExtends = parentLocalClassInChain && !localClass.pimExtends.includes(parentLocalClassInChain.iri as string);
        if (missingExtends) {
            const pimSetExtends = new PimSetExtends();
            pimSetExtends.pimResource = iri;
            pimSetExtends.pimExtends = [...localClass.pimExtends, (parentLocalClassInChain as PimClass).iri as string];
            await store.applyOperation(pimSchema, pimSetExtends);
        }

        parentLocalClassInChain = localClass;
    }

    return success;
}
