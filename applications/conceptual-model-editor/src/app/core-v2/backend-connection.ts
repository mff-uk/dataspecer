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
        const pckg = await service.getPackage(packageId);
        console.log("got package from backend", packageId, pckg);
        return pckg;
    };

    const getModelsFromBackend = async (packageId: string) => {
        const models = await service.constructSemanticModelPackageModels(packageId);
        console.log(models);
        return models;
    };

    const getViewsFromBackend = async (packageId: string) => {
        return constructViewsMock();
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
        const pckg = await service.createPackage(".root", {
            id: packageId,
            name: { cs: packageNameCs },
            tags: [],
        } as PackageEditable);
        console.log(pckg);
        alert(`package ${pckg.id}-${getOneNameFromLanguageString(pckg.name)} logged to console`);
        return pckg;
    };

    const listPackages = () => {
        return ["zvířátkový-package", "package-xyz", "testovací-package"];
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
        getViewsFromBackend,
        createPackage,
    };
};

const constructSemanticModelPackageModelsMock = async (packageId: string) => {
    if (packageId == "") {
        return [] as EntityModel[];
    }

    const sgov = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);
    sgov.allowClass("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
    sgov.allowClass("https://slovník.gov.cz/generický/bezbariérové-přístupy/pojem/bezbariérový-přístup");

    const dcterms = await createRdfsModel(
        ["https://mff-uk.github.io/demo-vocabularies/original/dublin_core_terms.ttl"],
        httpFetch
    );
    dcterms.fetchFromPimStore();

    const local = new InMemorySemanticModel();
    local.executeOperation(
        createClass({
            name: { cs: "fejk-třída-pes" },
            iri: "https://my-fake.iri.com/fejk-třída-pes",
        })
    );
    local.executeOperation(
        createClass({
            name: { cs: "fejk-třída-kočka" },
            iri: "https://my-fake.iri.com/fejk-třída-kočka",
        })
    );

    const models = [sgov, dcterms, local] as EntityModel[];
    return models;
};

const constructViewsMock = async () => {
    const viewLayout1 = {
        id: "view-1",
        name: { cs: "pohled-1" },
        elementPositionMap: new Map([
            ["https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl", { x: 100, y: 90 }],
            ["https://slovník.gov.cz/generický/bezbariérové-přístupy/pojem/bezbariérový-přístup", { x: 100, y: 140 }],
        ]),
    } as ViewLayout;

    const viewLayoutXyz = {
        id: "view-xyz",
        name: { cs: "pohled-xyz" },
        elementPositionMap: new Map([
            ["https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl", { x: 90, y: 100 }],
            ["https://slovník.gov.cz/generický/bezbariérové-přístupy/pojem/bezbariérový-přístup", { x: 140, y: 100 }],
        ]),
    } as ViewLayout;

    return [viewLayout1, viewLayoutXyz];
};
