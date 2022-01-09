import React, {useEffect, useState} from "react";
import {PimClass} from "@model-driven-data/core/pim/model";
import {StoreContext} from "../components/App";
import {Resource} from "../store/resource";

/**
 * Returns all ancestors or self for the given class by iri.
 * @param pimClassIri
 */
export const usePimExtends = (pimClassIri: string | null): {[iri: string]: Resource<PimClass>} => {
    const {store} = React.useContext(StoreContext);
    const [resources, setResources] = useState<{[iri: string]: Resource<PimClass>}>({});

    useEffect(() => {
        if (pimClassIri) {
            const resources: {[iri: string]: Resource<PimClass>} = {};

            const update = (iri: string, r: Resource) => {
                const resource = r as Resource<PimClass>;
                const resourceLastValue = resources[iri];
                resources[iri] = resource;

                // First of all, check if garbage collector is necessary

                const previousExtends = new Set<string>(resourceLastValue?.resource?.pimExtends ?? []);
                resource.resource?.pimExtends?.forEach(ext => previousExtends.delete(ext));
                const requireGC = previousExtends.size > 0;

                // Check new extends and add them

                const newExtends = new Set<string>(resource.resource?.pimExtends ?? []);
                resourceLastValue?.resource?.pimExtends?.forEach(ext => newExtends.delete(ext));
                newExtends.forEach(ext => {
                    if (!resources[ext]) {
                        store.addSubscriber(ext, update);
                    }
                });

                // Execute GC

                if (requireGC) {
                    const treeShouldContain: string[] = [];
                    const toVisit = pimClassIri ? [pimClassIri] : [];
                    let visitedIri: string | undefined;
                    while (visitedIri = toVisit.pop()) {
                        if (treeShouldContain.includes(visitedIri)) continue;

                        treeShouldContain.push(visitedIri);
                        resources[visitedIri]?.resource?.pimExtends?.forEach(e => toVisit.push(e));
                    }

                    const extra = Object.keys(resources).filter(i => !treeShouldContain.includes(i));
                    extra.forEach(iri => store.removeSubscriber(iri, update));
                    extra.forEach(iri => delete resources[iri]);
                }

                setResources({...resources});
            }

            store.addSubscriber(pimClassIri, update);

            return () => Object.keys(resources).forEach(iri => store.removeSubscriber(iri, update));
        } else {
            setResources({});
        }
    }, [pimClassIri, store]);

    return resources;
}
