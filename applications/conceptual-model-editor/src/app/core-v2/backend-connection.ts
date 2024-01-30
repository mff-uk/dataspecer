import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import { BackendPackageService, PackageEditable } from "@dataspecer/core-v2/project";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createClass } from "@dataspecer/core-v2/semantic-model/operations";
import { createRdfsModel, createSgovModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { useMemo } from "react";
import { ViewLayout } from "./context/view-context";
import { getOneNameFromLanguageString } from "./util/utils";
import { VisualEntityModel } from "@dataspecer/core-v2/visual-model";

export const useBackendConnection = () => {
    const BACKEND_URL = "http://localhost:3100";
    const service = useMemo(() => new BackendPackageService(BACKEND_URL, httpFetch), []);

    const getPackageFromBackend = async (packageId: string) => {
        const pkg = await service.getPackage(packageId);
        console.log("got package from backend", packageId, pkg);
        return pkg;
    };

    const getModelsFromBackend = async (packageId: string) => {
        console.log("getModelsFromBackend: gonna call service.constructXyz");
        const models = await service.constructSemanticModelPackageModels(packageId);
        console.log(models);
        return models;
    };

    const updateSemanticModelPackageModels = async (
        packageId: string,
        models: EntityModel[],
        visualModels: VisualEntityModel[]
    ) => {
        const pckg = await service.updateSemanticModelPackageModels(packageId, models, visualModels);
        console.log(`updated models for package ${packageId}`, models, visualModels, pckg);
        alert(`package ${packageId} updated on backend and logged to console`);
    };

    const createPackage = async (packageId: string, packageNameCs: string) => {
        const pkg = await service.createPackage(".root", {
            id: packageId,
            name: { cs: packageNameCs },
            tags: [],
        } as PackageEditable);
        console.log(pkg);
        alert(`package ${pkg.id}-${getOneNameFromLanguageString(pkg.name).t} logged to console`);
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
