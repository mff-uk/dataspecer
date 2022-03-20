import {PimClass} from "@model-driven-data/core/pim/model";
import {createPimClassIfMissing} from "./pim";
import {PimSetExtends} from "@model-driven-data/core/pim/operation";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";

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
    fromClass: PimClass,
    toClass: PimClass,
    pimSchema: string,
    store: FederatedObservableStore,
    sourcePimModel: CoreResourceReader,
): Promise<boolean> {
    // Find all classes which needs to be created or checked in order from most generic to most specific.
    const classesToProcess: string[] = [];

    // DFS that finds a SINGLE (random, if multiple exists) path
    const traverseFunction = async (currentClass: PimClass, path: Set<string> = new Set()): Promise<boolean> => {
        let success = currentClass.iri === toClass.iri;

        if (currentClass !== toClass) {
            path.add(currentClass.iri as string);
            for (const ext of currentClass.pimExtends) {
                const extClass = await sourcePimModel.readResource(ext) as PimClass;
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
    let parentClassInChain: PimClass | null = null; // This is the parent class of the current one from the CIM
    let parentLocalClassInChain: PimClass | null = null; // Patent of the current one but from the local store
    for (const classToProcessIri of classesToProcess) {
        const classToProcess = await sourcePimModel.readResource(classToProcessIri) as PimClass;

        const iri = await createPimClassIfMissing(classToProcess, pimSchema, store);
        const localClass = await store.readResource(iri) as PimClass;

        if (parentClassInChain &&
            !classToProcess.pimExtends.includes(parentClassInChain?.iri as string)) {
            throw new Error(`Assert error in AddClassSurroundings: class in chain does not extend parent class.`);
        }

        const missingExtends = parentLocalClassInChain && !localClass.pimExtends.includes(parentLocalClassInChain.iri as string);
        if (missingExtends) {
            const pimSetExtends = new PimSetExtends();
            pimSetExtends.pimResource = iri;
            pimSetExtends.pimExtends = [...localClass.pimExtends, (parentLocalClassInChain as PimClass).iri as string];
            await store.applyOperation(pimSchema, pimSetExtends);
        }

        parentClassInChain = classToProcess;
        parentLocalClassInChain = localClass;
    }

    return success;
}
