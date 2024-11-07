import { isSemanticModelGeneralization, SemanticModelClass, SemanticModelEntity } from '@dataspecer/core-v2/semantic-model/concepts';
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { createPimClassIfMissing } from "./pim";
import { createGeneralization } from '@dataspecer/core-v2/semantic-model/operations';

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
    fromClass: SemanticModelClass, // This is the Semantic model class we want to go from, and it is already in the store
    toClass: SemanticModelClass,// This is the Semantic model class we want to go to, and it is from the source store
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
    let parentLocalClassInChain: SemanticModelClass | null = null; // Patent of the current one but from the local store
    for (const classToProcessIri of classesToProcess) {
        const classToProcess = sourcePimModel.find(e => e.iri === classToProcessIri) as SemanticModelClass;

        const iri = await createPimClassIfMissing(classToProcess, pimSchema, store);
        const localClass = await store.readResource(iri) as SemanticModelClass;

        // todo: Here we need to check whether class with id as iri has parentLocalClassInChain in its parent
        const op = createGeneralization({
            child: localClass.id as string,
            parent: parentLocalClassInChain?.id as string,
        });

        // @ts-ignore
        await store.applyOperation(pimSchema, op);

        parentLocalClassInChain = localClass;
    }

    return success;
}
