import {PackageService, SemanticModelPackageService} from "./package-service";
import {EntityModel} from "../../entity-model";
import {Package, PackageEditable} from "./package";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {createPimModel, createRdfsModel, createSgovModel} from "../../semantic-model/simplified";
import {HttpEntityModel} from "../../entity-model/http-entity-model";
import {WritableSemanticModelAdapter} from "../../semantic-model/writable-semantic-model-adapter";

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
        return await result.json() as Package;
    }


    async createPackage(parentPackageId: string, data: PackageEditable): Promise<Package> {
        const result = await this.httpFetch(this.getPackageUrl(parentPackageId).toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        });
        return await result.json() as Package;
    }

    async updatePackage(packageId: string, data: Partial<PackageEditable>): Promise<Package> {
        const result = await this.httpFetch(this.getPackageUrl(packageId).toString(), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        });
        return await result.json() as Package;
    }

    async deletePackage(packageId: string): Promise<void> {
        await this.httpFetch(this.getPackageUrl(packageId).toString(), {
            method: "DELETE",
        });
    }

    async constructSemanticModelPackageModels(packageId: string): Promise<EntityModel[]> {
        const url = this.getPackageUrl(packageId);
        url.pathname += "/semantic-models";
        const result = await this.httpFetch(url.toString());
        const modelDescriptors = await result.json() as any[];

        const constructedModels: EntityModel[] = [];
        // todo: use more robust approach
        for (const modelDescriptor of modelDescriptors) {
            if (modelDescriptor.type === "https://dataspecer.com/core/model-descriptor/sgov") {
                const model = createSgovModel("https://slovník.gov.cz/sparql", this.httpFetch);
                await model.unserializeModel(modelDescriptor);
                constructedModels.push(model);
            } else if (modelDescriptor.type === "https://dataspecer.com/core/model-descriptor/pim") {
                const model = await createPimModel(modelDescriptor.backendUrl, modelDescriptor.dataSpecificationIri, this.httpFetch);
                constructedModels.push(model);
            } else if (modelDescriptor.type === "https://dataspecer.com/core/model-descriptor/rdfs") {
                const model = await createRdfsModel(modelDescriptor.urls, this.httpFetch);
                constructedModels.push(model);
            } else if (modelDescriptor.type === "https://ofn.gov.cz/store-descriptor/http") {
                constructedModels.push(await createHttpSemanticModel(modelDescriptor, this.httpFetch));
            } else {
                throw new Error(`Unknown model descriptor type: ${modelDescriptor.type}. Can not create such model.`);
            }
        }

        return constructedModels;
    }

    async updateSemanticModelPackageModels(packageId: string, models: EntityModel[]): Promise<Package> {
        const modelDescriptors: {}[] = [];

        for (const model of models) {
            // @ts-ignore
            modelDescriptors.push(model.serializeModel());
        }

        const url = this.getPackageUrl(packageId);
        url.pathname += "/semantic-models";
        const result = await this.httpFetch(url.toString(), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(modelDescriptors),
        });
        return null as unknown as Package;
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

    private getPackageUrl(packageId: string): URL {
        const url = new URL(this.backendUrl + "/packages");
        url.searchParams.append("packageId", packageId);
        return url;
    }
}