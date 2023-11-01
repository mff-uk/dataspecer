import {PackageService, SemanticModelPackageService} from "./package-service";
import {EntityModel} from "../../entity-model";
import {Package, PackageEditable} from "./package";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";

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
        return [];
    }

    async updateSemanticModelPackageModels(packageId: string, models: EntityModel[]): Promise<Package> {
        const url = this.getPackageUrl(packageId);
        url.pathname += "/set-semantic-models";
        const result = await this.httpFetch(this.getPackageUrl(packageId).toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(models),
        });
        return await result.json() as Package;
    }

    private getPackageUrl(packageId: string): URL {
        const url = new URL(this.backendUrl + "/packages");
        url.searchParams.append("packageId", packageId);
        return url;
    }
}