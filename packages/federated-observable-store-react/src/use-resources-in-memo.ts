import { Entity } from '@dataspecer/core-v2';
import {CoreResource} from "@dataspecer/core/core";
import {useFederatedObservableStore} from "./store";
import {Resource} from "@dataspecer/federated-observable-store/resource";
import {useCallback, useEffect, useRef, useState} from "react";

class IrrelevantExecution {

}

/**
 * Provides `getResource` for accessing resources from the store. The function result is memoized and automatically
 * re-ran either if the dependencies or resources change. The last value is preserved during the loading.
 *
 * @example
 * // returns technical labels of the given class properties
 *  const [labels, isLoading] = useResourcesInMemo(async (getResource) => {
 *     const resource = await getResource(RESOURCE);
 *     const labels = [];
 *     for (const part of resource.dataPsmParts) {
 *       const partResource = await getResource(part);
 *       labels.push(partResource.dataPsmTechnicalLabel);
 *     }
 *     return labels;
 *   }, [RESOURCE]);
 * @param fnc Memoized function
 * @param deps Dependency array
 * @returns [memoized_result, is_loading]
 */
export function useResourcesInMemo<ReturnValue>(fnc: (getResource: <ResourceType extends CoreResource | Entity>(iri: string) => Promise<ResourceType | null>) => Promise<ReturnValue>, deps: any[]): [ReturnValue|undefined, boolean] {
  const store = useFederatedObservableStore();

  // List of IRIs the function depends on
  const lastRunDependencies = useRef(new Set<string>());

  // Cache is used only for updates to trigger re-run
  const cache = useRef(new Map<string, Resource>());

  // Hack to re-run function setEffectTrigger({});
  const [effectTrigger, setEffectTrigger] = useState({});

  // Triggers re-run if the resource has changed
  const ignoreUpdate = useRef(false);
  const cacheUpdater = useCallback((iri: string, resource: Resource) => {
    const cached = cache.current.get(iri);
    if (!ignoreUpdate.current && !resource.isLoading && cached?.resource !== resource?.resource && lastRunDependencies.current.has(iri)) {
      lastRunDependencies.current.clear();
      setEffectTrigger({});
    }
    cache.current.set(iri, resource);
  }, []);

  // Function's output state
  const [state, setState] = useState<[ReturnValue|undefined, boolean]>([undefined, true]);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Main useEffect that triggers the function
  useEffect(() => {
    lastRunDependencies.current.clear();

    // set loading and keep the previous state
    if (!stateRef.current[1]) {
      setState([stateRef.current[0], true]);
    }

    let isRelevant = true;

    const getResource = async <ResourceType extends CoreResource | Entity>(iri: string) => {
      if (!cache.current.has(iri)) {
        ignoreUpdate.current = true;
        store.addSubscriber(iri, cacheUpdater);
        ignoreUpdate.current = false;
      }

      lastRunDependencies.current.add(iri);

      const resource = await store.readResource(iri);

      if (isRelevant) {
        return resource as ResourceType;
      } else {
        throw new IrrelevantExecution();
      }
    };

    fnc(getResource).then(result => {
      if (isRelevant) {
        setState([result, false]);
        // free the cache
        [...cache.current.keys()].filter(iri => !lastRunDependencies.current.has(iri)).forEach(iri => {
          store.removeSubscriber(iri, cacheUpdater);
          cache.current.delete(iri);
        });
      }
    }).catch(error => {
      if (!(error instanceof IrrelevantExecution)) {
        throw error;
      }
    });

    return () => {
      isRelevant = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectTrigger, ...deps]);

  return state;
}
