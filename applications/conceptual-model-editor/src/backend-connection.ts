import { useMemo } from "react";

import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import { BackendPackageService, type ResourceEditable } from "@dataspecer/core-v2/project";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import type { VisualModel } from "@dataspecer/core-v2/visual-model";

export const useBackendConnection = () => {
    // should fail already when spinning up the next app
    const service = useMemo(() => new BackendPackageService(import.meta.env.VITE_PUBLIC_APP_BACKEND!, httpFetch), []); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const backendPackageRootUrl = useMemo(() => import.meta.env.VITE_PUBLIC_APP_BACKEND_PACKAGE_ROOT!, []); // eslint-disable-line @typescript-eslint/no-non-null-assertion

    const getPackageFromBackend = async (packageId: string) => {
        return service.getPackage(packageId);
    };

    const getAllPackagesFromBackend = async () => {
        return getPackageFromBackend(backendPackageRootUrl);
    };

    const getModelsFromBackend = async (packageId: string) => {
        return service.constructSemanticModelPackageModels(packageId);
    };

    const updateSemanticModelPackageModels = async (
        packageId: string,
        models: EntityModel[],
        visualModels: VisualModel[]
    ) => {
        return service.updateSemanticModelPackageModels(packageId, models, visualModels);
    };

    const createPackage = async (packageId: string, packageNameCs: string) => {
        const pkg = await service.createPackage(backendPackageRootUrl, {
            iri: packageId,
            userMetadata: {
                name: { cs: packageNameCs },
                tags: [],
            },
        } as ResourceEditable);
        console.log(pkg);
        alert(`package ${pkg.iri}-${packageNameCs} logged to console`);
        return pkg;
    };

    return {
        getPackageFromBackend,
        getAllPackagesFromBackend,
        updateSemanticModelPackageModels,
        getModelsFromBackend,
        createPackage,
    };
};
