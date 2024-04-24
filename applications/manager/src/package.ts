import { createContext, useEffect, useRef, useState } from "react";
import { Package } from "../../../packages/core-v2/lib/project/resource/resource";
import { BackendPackageService } from "@dataspecer/core-v2/project";
import { LanguageString } from "@dataspecer/core/core/core-resource";

const backendUrl = import.meta.env.VITE_BACKEND;

type ResourceWithIris = Package & { subResourcesIri: string[] };

export const ResourcesContext = createContext<Record<string, ResourceWithIris>>({});
export const RootResourcesContext = createContext<string[]>([]);

export const packageService = new BackendPackageService(backendUrl, (...p) => fetch(...p));

const resourcesBeingFetched = new Set<string>();

let resourcesMemory:  React.MutableRefObject<Record<string, ResourceWithIris>>;

let setResourcesReact: (resources: Record<string, ResourceWithIris>) => void;

export async function requestLoadPackage(iri: string, forceUpdate = false) {
    if (resourcesBeingFetched.has(iri) || ((resourcesMemory.current[iri] as ResourceWithIris).subResourcesIri && !forceUpdate)) {
        return;
    }
    resourcesBeingFetched.add(iri);
    
    const pckg = await packageService.getPackage(iri) as ResourceWithIris;

    const copiedResourcesMemory = {...resourcesMemory.current};

    pckg.subResourcesIri = pckg.subResources!.map((resource) => resource.iri);
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
    resourcesMemory.current = copiedResourcesMemory;
}

export async function modifyUserMetadata(iri: string, metadata: {label?: LanguageString, description?: LanguageString}) {
    const pckg = await packageService.updatePackage(iri, { userMetadata: metadata });
    const copiedResourcesMemory = {...resourcesMemory.current};
    if (copiedResourcesMemory[iri]) {
        copiedResourcesMemory[iri] = {...copiedResourcesMemory[iri], userMetadata: pckg.userMetadata, metadata: pckg.metadata};
    }
    setResourcesReact(copiedResourcesMemory);
}

export async function deleteResource(iri: string) {
    await packageService.deletePackage(iri);
    const copiedResourcesMemory = {...resourcesMemory.current};
    delete copiedResourcesMemory[iri];
    for (const resource of Object.values(copiedResourcesMemory)) {
        if (resource.subResourcesIri?.includes(iri)) {
            copiedResourcesMemory[resource.iri] = {...resource, subResourcesIri: resource.subResourcesIri.filter((subIri) => subIri !== iri)};
        }
    }
    setResourcesReact(copiedResourcesMemory);
}

export const useResourcesContext = () => {
    resourcesMemory = useRef<Record<string, ResourceWithIris>>({});

    const [rootResources, setRootResources] = useState<string[]>([]);
    const [resources, setResources] = useState<Record<string, ResourceWithIris>>({});
    setResourcesReact = setResources;
    resourcesMemory.current = resources;

    useEffect(() => {
        (async () => {
            const response = await fetch(backendUrl + "/resources/root-resources");
            const rootResources = await response.json() as ResourceWithIris[];

            setRootResources(rootResources.map((resource) => resource.iri));

            resourcesMemory.current = {...Object.fromEntries(rootResources.map((resource) => [resource.iri, resource])), ...resourcesMemory.current};
            setResourcesReact(resourcesMemory.current);
        })();
    }, []);


    return {
        rootResources,
        resources,
    };
}
