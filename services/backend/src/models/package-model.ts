import {LocalStoreModel} from "./local-store-model";
import {PrismaClient, Package as PrismaPackage} from "@prisma/client";
import {Package, PackageEditable} from "@dataspecer/core-v2/project";

export class PackageModel {
    private readonly storeModel: LocalStoreModel;
    private readonly prismaClient: PrismaClient;

    constructor(storeModel: LocalStoreModel, prismaClient: PrismaClient) {
        this.storeModel = storeModel;
        this.prismaClient = prismaClient;
    }

    private async prismaPackageToPackage(prismaPackage: PrismaPackage, id: string): Promise<Package> {
        const visitedPackages = new Set<number>();

        const prismaPackageToPackage = async (prismaPackage: PrismaPackage, packageId: string): Promise<Package> => {
            if (visitedPackages.has(prismaPackage.id)) {
                throw new Error("Circular dependency detected");
            }
            visitedPackages.add(prismaPackage.id);

            const subPackages = await this.prismaClient.package.findMany({where: {parentPackageId: prismaPackage.id}});

            const packageData = JSON.parse(prismaPackage.metadata);

            return {
                id: packageId,
                name: packageData.name ?? {},
                tags: packageData.tags ?? [],
                subPackages: await Promise.all(subPackages.map(p => prismaPackageToPackage(p, packageId + "/" + p.iriChunk))),
                providesSemanticModel: packageData.models && packageData.models.length > 0,
            } as Package;
        }

        return await prismaPackageToPackage(prismaPackage, id);
    }

    async findPackage(packageId: string): Promise<PrismaPackage|null> {
        const chunks = packageId.split("/");

        let foundPackage: PrismaPackage|null = null;
        let chunkIndex = chunks.length;
        for (chunkIndex = chunks.length; chunkIndex > 0; chunkIndex--) {
            const prefix = chunks.slice(0, chunkIndex).join("/");
            const found = await this.prismaClient.package.findMany({where: {iriChunk: prefix, parentPackageId: null}});
            if (found.length > 0) {
                foundPackage = found[0];
                break;
            }
        }

        for (; chunkIndex < chunks.length && foundPackage; chunkIndex++) {
            const chunk = chunks[chunkIndex];
            const found = await this.prismaClient.package.findMany({where: {parentPackageId: foundPackage!.id, iriChunk: chunk}});
            if (found.length > 0) {
                foundPackage = found[0];
            } else {
                foundPackage = null;
            }
        }

        return foundPackage;
    }

    async getPackageWithChildren(packageId: string): Promise<Package|null> {
        const pkg = await this.findPackage(packageId);
        if (!pkg) {
            return null;
        }

        return this.prismaPackageToPackage(pkg, packageId);
    }

    async listPackages(): Promise<Package[]> {
        const pkgs = await this.prismaClient.package.findMany();
        return await Promise.all(pkgs.map((pkg) => this.prismaPackageToPackage(pkg, pkg.iriChunk)));
    }

    async createPackage(parentPackageId: string, data: PackageEditable): Promise<Package> {
        let newParentPackageId: number|null = null;
        let newChunk = data.id;

        if (parentPackageId !== ".root") {
            const parentPackage = await this.findPackage(parentPackageId);

            if (!parentPackage) {
                throw new Error("Parent package not found");
            }

            if (!data.id.startsWith(parentPackageId + "/")) {
                throw new Error("Package id must be prefixed with parent package id");
            }

            newChunk = data.id.substring(parentPackageId.length + 1);

            if (newChunk.length === 0 || newChunk.indexOf("/") !== -1) {
                throw new Error("Package id must not contain empty chunks, nor slashes.");
            }

            newParentPackageId = parentPackage.id;
        }

        const createdPackage = await this.prismaClient.package.create({
            data: {
                parentPackageId: newParentPackageId,
                iriChunk: newChunk,
                metadata: JSON.stringify(data),
            }
        });

        return this.prismaPackageToPackage(createdPackage, data.id as string);
    }

    async updatePackage(packageId: string, data: Partial<PackageEditable>): Promise<void> {
        const pkg = await this.findPackage(packageId);
        if (!pkg) {
            throw new Error("Package not found");
        }

        const packageData = JSON.parse(pkg.metadata);
        Object.assign(packageData, data);

        await this.prismaClient.package.update({
            where: {id: pkg.id},
            data: {metadata: JSON.stringify(packageData)},
        });
    }

    /**
     * Deletes the package by package id and all its subpackages.
     * @param packageId
     */
    async deletePackage(packageId: string): Promise<void> {
        const pkg = await this.findPackage(packageId);
        if (!pkg) {
            throw new Error("Package not found");
        }

        const deletePackage = async (pkg: PrismaPackage) => {
            const subPackages = await this.prismaClient.package.findMany({where: {parentPackageId: pkg.id}});
            await Promise.all(subPackages.map(deletePackage));
            await this.prismaClient.package.delete({where: {id: pkg.id}});
        }

        await deletePackage(pkg);
    }

    async getSemanticModels(packageId: string): Promise<any[]> {
        const pkg = await this.findPackage(packageId);
        if (!pkg) {
            throw new Error("Package not found");
        }

        const packageData = JSON.parse(pkg.metadata);
        return packageData.models ?? [];
    }

    async setSemanticModels(packageId: string, models: any[]): Promise<void> {
        const pkg = await this.findPackage(packageId);
        if (!pkg) {
            throw new Error("Package not found");
        }

        const packageData = JSON.parse(pkg.metadata);
        packageData.models = models;
        await this.prismaClient.package.update({
            where: {id: pkg.id},
            data: {metadata: JSON.stringify(packageData)},
        });
    }
}