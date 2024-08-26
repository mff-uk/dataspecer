import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { EntityModel } from "../../entity-model";
import { HttpEntityModel } from "../../entity-model/http-entity-model";
import { LOCAL_PACKAGE, LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL } from "../../model/known-models";
import { createPimModel, createRdfsModel, createSgovModel } from "../../semantic-model/simplified";
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
        if (result.status === 404) {
            // @ts-ignore
            return null;
        }
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

    async deleteResource(iri: string): Promise<void> {
        await this.httpFetch(this.getResourceUrl(iri).toString(), {
            method: "DELETE",
        });
    }

    /**
     * This method is used by CME editor for transparently loading all models from a given package.
     * @todo It should not be a package, but a model itself with all its dependencies. Now it is a model. 
     * @param packageId 
     * @returns 
     */
    async constructSemanticModelPackageModels(
        packageId: string
    ): Promise<readonly [EntityModel[], VisualEntityModel[]]> {
        const entityModels: EntityModel[] = [];
        const visualModels: VisualEntityModel[] = [];
        
        const recursivellyLoadPackage = async (packageId: string) => {
            const pckg = await this.getPackage(packageId);
            const [entity, visual] = await this.getModelsFromResources(pckg.subResources!);
            entityModels.push(...entity);
            visualModels.push(...visual);

            for (const resource of pckg.subResources!) {
                if (resource.types.includes(LOCAL_PACKAGE)) {
                    await recursivellyLoadPackage(resource.iri);
                }
            }
        }

        await recursivellyLoadPackage(packageId);

        return [entityModels, visualModels] as const;
    }

    async updateSemanticModelPackageModels(
        packageId: string,
        models: EntityModel[],
        visualModels: VisualEntityModel[]
    ): Promise<boolean> {
        const responseStatuses = new Set<number>();
        for (const visualModel of [...models, ...visualModels]) {
            // @ts-ignore
            const modelSerialization = visualModel.serializeModel();
            const iri = visualModel.getId();
            const name = modelSerialization.modelAlias ?? modelSerialization.alias;

            const response = await this.httpFetch(this.getResourceUrl(iri).toString());
            const userMetadata = name ? { label: { en: name } } : {};
            if (response.status !== 200) {
                const createdResponse = await this.httpFetch(this.getResourceUrl(packageId, true).toString(), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        iri: iri,
                        type: modelSerialization.type,
                        userMetadata: userMetadata
                    }),
                });
                responseStatuses.add(createdResponse.status);
            } else {
                const updatedResponse = await this.httpFetch(this.getResourceUrl(iri).toString(), {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userMetadata: userMetadata
                    }),
                });
                responseStatuses.add(updatedResponse.status);
            }

            const updatedResponse = await this.httpFetch(this.getBlobUrl(iri).toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(modelSerialization),
            });
            responseStatuses.add(updatedResponse.status);
        }

        const anyErrors = [...responseStatuses.values()].filter((n) => n > 399).length;
        if (anyErrors > 0) {
            return false;
        }
        return true;
        // return null as any as Package; // todo
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
        const modelData = (await (await this.httpFetch(this.getBlobUrl(resource.iri).toString())).json()) as any;
        return { resource, ...modelData };
    }

    async getModelsFromResources(resources: BaseResource[]): Promise<readonly [EntityModel[], VisualEntityModel[]]> {
        const entityModels = [];
        const visualModels = [];

        for (const resource of resources) {
            const name = resource.userMetadata.label?.en ?? resource.userMetadata.label?.cs;

            // Visual model
            if (resource.types.includes(LOCAL_VISUAL_MODEL)) {
                const modelData = (await (
                    await this.httpFetch(this.getBlobUrl(resource.iri).toString())
                ).json()) as any;
                modelData.modelAlias = name;
                const model = createVisualModel(resource.iri).deserializeModel(modelData); // ok
                visualModels.push(model);
            }

            // SGOV model
            if (resource.types.includes("https://dataspecer.com/core/model-descriptor/sgov")) {
                const model = createSgovModel("https://slovník.gov.cz/sparql", this.httpFetch, resource.iri);
                const modelData = (await (
                    await this.httpFetch(this.getBlobUrl(resource.iri).toString())
                ).json()) as any;
                modelData.modelAlias = name;
                await model.unserializeModel(modelData);
                entityModels.push(model);
            }

            // Semantic model
            if (resource.types.includes(LOCAL_SEMANTIC_MODEL)) {
                const modelData = (await (
                    await this.httpFetch(this.getBlobUrl(resource.iri).toString())
                ).json()) as any;
                modelData.modelAlias = name;
                const model = createInMemorySemanticModel().deserializeModel(modelData);
                entityModels.push(model);
            }

            // Pim store wrapper
            if (resource.types.includes("https://dataspecer.com/core/model-descriptor/pim-store-wrapper")) {
                const modelData = (await (
                    await this.httpFetch(this.getBlobUrl(resource.iri).toString())
                ).json()) as any;
                const model = new PimStoreWrapper(modelData.pimStore, modelData.id, name, modelData.urls);
                model.fetchFromPimStore();
                entityModels.push(model);
            }
        }

        return [entityModels, visualModels] as const;
    }

    /**
     * @deprecated Used only for importing models in cme
     */
    async getModelsFromModelDescriptors(modelDescriptors: any[]) {
        const constructedEntityModels: EntityModel[] = [];
        const constructedVisualModels: VisualEntityModel[] = [];
        // todo: use more robust approach
        for (const modelDescriptor of modelDescriptors) {
            if (modelDescriptor.type === "https://dataspecer.com/core/model-descriptor/sgov") {
                const model = createSgovModel("https://slovník.gov.cz/sparql", this.httpFetch);
                await model.unserializeModel(modelDescriptor);
                constructedEntityModels.push(model);
            } else if (modelDescriptor.type === "https://dataspecer.com/core/model-descriptor/pim") {
                const model = await createPimModel(
                    modelDescriptor.backendUrl,
                    modelDescriptor.dataSpecificationIri,
                    this.httpFetch
                );
                constructedEntityModels.push(model);
            } else if (modelDescriptor.type === "https://dataspecer.com/core/model-descriptor/rdfs") {
                const model = await createRdfsModel(modelDescriptor.urls, this.httpFetch);
                constructedEntityModels.push(model);
            } else if (modelDescriptor.type === "https://ofn.gov.cz/store-descriptor/http") {
                constructedEntityModels.push(await createHttpSemanticModel(modelDescriptor, this.httpFetch));
            } else if (
                modelDescriptor.type === "https://dataspecer.com/core/model-descriptor/visual-model" ||
                modelDescriptor.type === LOCAL_VISUAL_MODEL
            ) {
                const model = createVisualModel(modelDescriptor.modelId).deserializeModel(modelDescriptor);
                constructedVisualModels.push(model);
            } else if (
                modelDescriptor.type === "https://dataspecer.com/core/model-descriptor/in-memory-semantic-model" ||
                modelDescriptor.type === LOCAL_SEMANTIC_MODEL
            ) {
                const model = createInMemorySemanticModel().deserializeModel(modelDescriptor);
                constructedEntityModels.push(model);
            } else if (modelDescriptor.type === "https://dataspecer.com/core/model-descriptor/pim-store-wrapper") {
                const model = new PimStoreWrapper(modelDescriptor.pimStore, modelDescriptor.id, modelDescriptor.alias);
                model.fetchFromPimStore();
                constructedEntityModels.push(model);
            } else {
                throw new Error(`Unknown model descriptor type: ${modelDescriptor.type}. Can not create such model.`);
            }
        }

        return [constructedEntityModels, constructedVisualModels] as const;
    }

    async copyRecursively(resourceToCopy: string, newParentResource: string, userMetadata: BaseResource["userMetadata"] = {}) {
        const url = new URL(this.backendUrl + "/repository/copy-recursively");
        url.searchParams.append("iri", resourceToCopy);
        url.searchParams.append("parentIri", newParentResource);

        const result = await this.httpFetch(url.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userMetadata),
        });
        const data = await result.json();
    }
}
