import { createContext, useEffect, useState } from "react";
import { Package } from "../../../packages/core-v2/lib/project/resource/resource";
import { BackendPackageService } from "@dataspecer/core-v2/project";

const backendUrl = import.meta.env.VITE_BACKEND;

type ResourceWithIris = Package & { subResourcesIri: string[] };

export const ResourcesContext = createContext<Record<string, ResourceWithIris>>({});
export const RootResourcesContext = createContext<string[]>([]);

const packageService = new BackendPackageService(backendUrl, (...p) => fetch(...p));

const resourcesBeingFetched = new Set<string>();

let resourcesMemory: Record<string, ResourceWithIris> = {};

let setResourcesReact: (resources: Record<string, ResourceWithIris>) => void;

export async function requestLoadPackage(iri: string, forceUpdate = false) {
    console.log("requestLoadPackage", iri, forceUpdate);
    if (resourcesBeingFetched.has(iri) || ((resourcesMemory[iri] as ResourceWithIris).subResourcesIri && !forceUpdate)) {
        return;
    }
    resourcesBeingFetched.add(iri);
    
    const pckg = await packageService.getPackage(iri) as ResourceWithIris;

    const copiedResourcesMemory = {...resourcesMemory};

    pckg.subResourcesIri = pckg.subResources!.map((resource) => resource.iri);
    console.log(pckg.subResources, pckg);
    for (const resource of pckg.subResources!) {
        if (copiedResourcesMemory[resource.iri]) {
            continue;
        }
        copiedResourcesMemory[resource.iri] = resource as ResourceWithIris;
    }
    delete pckg.subResources;
    copiedResourcesMemory[iri] = pckg;
    resourcesBeingFetched.delete(iri);
    setResourcesReact(copiedResourcesMemory);
    resourcesMemory = copiedResourcesMemory;
}

export const useResourcesContext = () => {
    const [rootResources, setRootResources] = useState<string[]>([]);
    const [resources, setResources] = useState<Record<string, ResourceWithIris>>({});
    setResourcesReact = setResources;

    useEffect(() => {
        (async () => {
            const response = await fetch(backendUrl + "/resources/root-resources");
            const rootResources = await response.json() as ResourceWithIris[];

            setRootResources(rootResources.map((resource) => resource.iri));
            resourcesMemory = {...resourcesMemory, ...Object.fromEntries(rootResources.map((resource) => [resource.iri, resource]))};
            setResourcesReact(resourcesMemory);
        })();
    }, []);

    return {
        rootResources,
        resources,
    };
}
