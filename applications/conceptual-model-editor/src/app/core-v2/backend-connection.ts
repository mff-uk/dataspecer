import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import { BackendPackageService, PackageEditable } from "@dataspecer/core-v2/project";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { useMemo } from "react";
import { VisualEntityModel } from "@dataspecer/core-v2/visual-model";

export const useBackendConnection = () => {
    console.log(process.env);
    const service = useMemo(() => new BackendPackageService(process.env.NEXT_PUBLIC_APP_BACKEND!, httpFetch), []);

    const getPackageFromBackend = async (packageId: string) => {
        const pkg = await service.getPackage(packageId);
        return pkg;
    };

    const getModelsFromBackend = async (packageId: string) => {
        const models = await service.constructSemanticModelPackageModels(packageId);
        console.log(models);
        return models;
    };

    const updateSemanticModelPackageModels = async (
        packageId: string,
        models: EntityModel[],
        visualModels: VisualEntityModel[]
    ) => {
        const pkg = await service.updateSemanticModelPackageModels(packageId, models, visualModels);
        console.log(`updated models for package ${packageId}`, models, visualModels, pkg);
        alert(`package ${packageId} updated on backend and logged to console`);
    };

    const createPackage = async (packageId: string, packageNameCs: string) => {
        const pkg = await service.createPackage(".root", {
            id: packageId,
            name: { cs: packageNameCs },
            tags: [],
        } as PackageEditable);
        console.log(pkg);
        alert(`package ${pkg.id}-${packageNameCs} logged to console`);
        return pkg;
    };

    const listPackages = async () => {
        return await service.listPackages();
    };

    const listViews = () => {
        return ["view-1", "view-xyz"];
    };

    return {
        service,
        getPackageFromBackend,
        updateSemanticModelPackageModels,
        listPackages,
        listViews,
        getModelsFromBackend,
        createPackage,
    };
};
