import { BackendPackageService } from "@dataspecer/core-v2/project";
import { LanguageString } from "@dataspecer/core/core/core-resource";
import { createContext, useRef, useState } from "react";
import { Package } from "../../../packages/core-v2/lib/project/resource/resource";
import { StructureEditorBackendService } from "@dataspecer/backend-utils/connectors/specification";

const backendUrl = import.meta.env.VITE_BACKEND;

type ResourceWithIris = Package & { subResourcesIri: string[] };

export const ResourcesContext = createContext<Record<string, ResourceWithIris>>({});

export const packageService = new BackendPackageService(backendUrl, (...p) => fetch(...p));

export const getSpecificationService = (parentPackage: string) => new StructureEditorBackendService(backendUrl, (...p) => fetch(...p), parentPackage);

const resourcesBeingFetched = new Set<string>();

let resourcesMemory:  React.MutableRefObject<Record<string, ResourceWithIris>>;

let setResourcesReact: (resources: Record<string, ResourceWithIris>) => void;

export async function requestLoadPackage(iri: string, forceUpdate = false) {
    if (resourcesBeingFetched.has(iri) || ((resourcesMemory.current[iri] as ResourceWithIris)?.subResourcesIri && !forceUpdate)) {
        return;
    }
    resourcesBeingFetched.add(iri);

    const pckg = await packageService.getPackage(iri) as ResourceWithIris;
    resourcesBeingFetched.delete(iri);

    const copiedResourcesMemory = {...resourcesMemory.current};

    if (pckg) {
        pckg.subResourcesIri = pckg.subResources!.map((resource) => resource.iri);

        for (const resource of pckg.subResources!) {
            if (copiedResourcesMemory[resource.iri]) {
                continue;
            }
            copiedResourcesMemory[resource.iri] = resource as ResourceWithIris;
        }
        delete pckg.subResources;
    }

    copiedResourcesMemory[iri] = pckg;
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
        if (!resource) {
            continue;
        }
        if (resource.subResourcesIri?.includes(iri)) {
            copiedResourcesMemory[resource.iri] = {...resource, subResourcesIri: resource.subResourcesIri.filter((subIri) => subIri !== iri)};
        }
    }
    setResourcesReact(copiedResourcesMemory);
}

export const useResourcesContext = () => {
    resourcesMemory = useRef<Record<string, ResourceWithIris>>({});

    const [resources, setResources] = useState<Record<string, ResourceWithIris>>({});
    setResourcesReact = setResources;
    resourcesMemory.current = resources;

    return {
        resources,
    };
}
