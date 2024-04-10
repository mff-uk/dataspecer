import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { EntityModel } from "../../entity-model";
import { HttpEntityModel } from "../../entity-model/http-entity-model";
import { LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL } from "../../model/known-models";
import { createSgovModel } from "../../semantic-model/simplified";
import { createInMemorySemanticModel } from "../../semantic-model/simplified/in-memory-semantic-model";
import { createVisualModel } from "../../semantic-model/simplified/visual-model";
import { PimStoreWrapper } from "../../semantic-model/v1-adapters";
import { WritableSemanticModelAdapter } from "../../semantic-model/writable-semantic-model-adapter";
import { VisualEntityModel } from "../../visual-model";
import { BaseResource, Package, ResourceEditable } from "../resource/resource";
import { PackageService, SemanticModelPackageService } from "./package-service";

async function createHttpSemanticModel(data: any, httpFetch: HttpFetch): Promise<WritableSemanticModelAdapter> {
    const baseModel = HttpEntityModel.createFromDescriptor(data, httpFetch);
    await baseModel.load();
    const model = new WritableSemanticModelAdapter(baseModel);
    // @ts-ignore
    model.serializeModel = () => data;
    return model;
}

/**
 * Implementation of PackageService that communicates with backend and provides semantic models.
 */
export class BackendPackageService implements PackageService, SemanticModelPackageService {
    private readonly backendUrl: string;
    protected readonly httpFetch: HttpFetch;

    constructor(backendUrl: string, httpFetch: HttpFetch) {
        this.backendUrl = backendUrl;
        this.httpFetch = httpFetch;
    }

    async getPackage(packageId: string): Promise<Package> {
        const result = await this.httpFetch(this.getPackageUrl(packageId).toString());
        return (await result.json()) as Package;
    }

    async createPackage(parentPackageId: string, data: ResourceEditable): Promise<Package> {
        const result = await this.httpFetch(this.getPackageUrl(parentPackageId, true).toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return (await result.json()) as Package;
    }

    async updatePackage(packageId: string, data: Partial<ResourceEditable>): Promise<Package> {
        const result = await this.httpFetch(this.getPackageUrl(packageId).toString(), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return (await result.json()) as Package;
    }

    async deletePackage(packageId: string): Promise<void> {
        await this.httpFetch(this.getPackageUrl(packageId).toString(), {
            method: "DELETE",
        });
    }

    async constructSemanticModelPackageModels(
        packageId: string
    ): Promise<readonly [EntityModel[], VisualEntityModel[]]> {
        const pckg = await this.getPackage(packageId);
        return this.getModelsFromResources(pckg.subResources!);
    }

    async updateSemanticModelPackageModels(
        packageId: string,
        models: EntityModel[],
        visualModels: VisualEntityModel[]
    ): Promise<Package> {
        for (const visualModel of [...models, ...visualModels]) {
            // @ts-ignore
            const modelSerialization = visualModel.serializeModel();
            const iri = visualModel.getId();

            const response = await this.httpFetch(this.getResourceUrl(iri).toString());
            if (response.status !== 200) {
                await this.httpFetch(this.getResourceUrl(packageId, true).toString(), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        iri: iri,
                        type: modelSerialization.type,
                    }),
                });
            }

            await this.httpFetch(this.getBlobUrl(iri).toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(modelSerialization),
            });
        }

        return null as any as Package; // todo
    }

    async createRemoteSemanticModel(packageId: string) {
        const url = this.getPackageUrl(packageId);
        url.pathname += "/semantic-models";
        const result = await this.httpFetch(url.toString(), {
            method: "POST",
        });
        const data = await result.json();

        return await createHttpSemanticModel(data, this.httpFetch);
    }

    private getPackageUrl(packageId: string, asParent: boolean = false): URL {
        const url = new URL(this.backendUrl + "/resources/packages");
        url.searchParams.append(asParent ? "parentIri" : "iri", packageId);
        return url;
    }

    private getResourceUrl(iri: string, asParent: boolean = false): URL {
        const url = new URL(this.backendUrl + "/resources");
        url.searchParams.append(asParent ? "parentIri" : "iri", iri);
        return url;
    }

    private getBlobUrl(iri: string, name?: string): URL {
        const url = new URL(this.backendUrl + "/resources/blob");
        url.searchParams.append("iri", iri);
        if (name) {
            url.searchParams.append("name", name);
        }
        return url;
    }

    private async getFullJsonModel(resource: BaseResource): Promise<object> {
        const modelData = await (await this.httpFetch(this.getBlobUrl(resource.iri).toString())).json() as any;
        return {resource, ...modelData};
    }

    async getModelsFromResources(resources: BaseResource[]): Promise<readonly [EntityModel[], VisualEntityModel[]]> {
        const entityModels = [];
        const visualModels = [];

        for (const resource of resources) {
            // Visual model
            if (resource.types.includes(LOCAL_VISUAL_MODEL)) {
                const modelData = await (await this.httpFetch(this.getBlobUrl(resource.iri).toString())).json() as any;
                const model = createVisualModel(resource.iri).deserializeModel(modelData); // ok
                visualModels.push(model);
            }

            // SGOV model
            if (resource.types.includes("https://dataspecer.com/core/model-descriptor/sgov")) {
                const model = createSgovModel("https://slovník.gov.cz/sparql", this.httpFetch, resource.iri);
                const modelData = await (await this.httpFetch(this.getBlobUrl(resource.iri).toString())).json() as any;
                await model.unserializeModel(modelData);
                entityModels.push(model);
            } 

            // Semantic model
            if (resource.types.includes(LOCAL_SEMANTIC_MODEL)) {
                const modelData = await (await this.httpFetch(this.getBlobUrl(resource.iri).toString())).json() as any;
                const model = createInMemorySemanticModel().deserializeModel(modelData);
                entityModels.push(model);
            }

            // Pim store wrapper
            if (resource.types.includes("https://dataspecer.com/core/model-descriptor/pim-store-wrapper")) {
                const modelData = await (await this.httpFetch(this.getBlobUrl(resource.iri).toString())).json() as any;
                const model = new PimStoreWrapper(modelData.pimStore, modelData.id, modelData.alias);
                model.fetchFromPimStore();
                entityModels.push(model);
            }
        }

        return [entityModels,visualModels] as const;
    }

    async getModelsFromModelDescriptors(modelDescriptors: any[]) {
        return [[], []] as const;
    }
}
