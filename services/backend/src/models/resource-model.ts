import { LOCAL_PACKAGE } from "@dataspecer/core-v2/model/known-models";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { PrismaClient, Resource as PrismaResource } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { storeModel } from './../main';
import { LocalStoreModel, ModelStore } from "./local-store-model";

/**
 * Base information every resource has or should have.
 */
export interface BaseResource {
    /**
     * Unique identifier of the resource.
     */
    iri: string;

    /**
     * All available types of the resource.
     * This means how the given resource can be interpreted.
     */
    types: string[];

    /**
     * User-friendly metadata that each resource may have.
     */
    userMetadata: {
        label?: LanguageString;
        description?: LanguageString;
        tags?: string[];
    };

    metadata: {
        modificationDate?: Date;
        creationDate?: Date;
    };

    dataStores: Record<string, string>;
}

export interface Package extends BaseResource {
    /**
     * List of sub-resources that are contained in this package.
     * If the value is undefined, the package was not-yet loaded.
     */
    subResources?: BaseResource[];
}

/**
 * Resource model manages resource in local database that is managed by Prisma.
 */
export class ResourceModel {
    private readonly storeModel: LocalStoreModel;
    private readonly prismaClient: PrismaClient;

    constructor(storeModel: LocalStoreModel, prismaClient: PrismaClient) {
        this.storeModel = storeModel;
        this.prismaClient = prismaClient;
    }
    
    getRootResources(): Promise<BaseResource[]> {
        return this.prismaClient.resource.findMany({where: {parentResourceId: null}})
            .then(resources => resources.map(resource => this.prismaResourceToResource(resource)));
    }

    /**
     * Returns a single resource or null if the resource does not exist.
     */
    async getResource(iri: string): Promise<BaseResource | null> {
        const prismaResource = await this.prismaClient.resource.findFirst({where: {iri}});
        if (prismaResource === null) {
            return null;
        }
        return this.prismaResourceToResource(prismaResource);
    }

    /**
     * Updates user metadata of the resource.
     */
    async updateResource(iri: string, userMetadata: {}) {
        const resource = await this.prismaClient.resource.findFirst({where: {iri}});
        let metadata = resource?.userMetadata ? JSON.parse(resource?.userMetadata!) as object : {};
        metadata = {
            ...metadata,
            ...userMetadata
        }
        await this.prismaClient.resource.update({
            where: {iri},
            data: {
                userMetadata: JSON.stringify(metadata),
            }
        });
        await this.updateModificationTime(iri);
    }

    /**
     * Deletes the resource and if the resource is a package, all sub-resources.
     */
    async deleteResource(iri: string) {
        const recursivelyDeleteResourceByPrismaResource = async (resource: PrismaResource) => {
            if (resource.representationType === LOCAL_PACKAGE) {
                const subResources = await this.prismaClient.resource.findMany({where: {parentResourceId: resource.id}});
                for (const subResource of subResources) {
                    await recursivelyDeleteResourceByPrismaResource(subResource);
                }
            }
            await this.deleteSingleResource(resource.iri);
        }

        const prismaResource = await this.prismaClient.resource.findFirst({where: {iri: iri}});
        if (prismaResource === null) {
           throw new Error("Resource not found.");
        }

        await recursivelyDeleteResourceByPrismaResource(prismaResource);
        if (prismaResource.parentResourceId !== null) {
            await this.updateModificationTimeById(prismaResource.parentResourceId);
        }
    }

    /**
     * Removes a single resource in database and all stores attached to it.
     * If the resource is a package, all sub-resources must be deleted manuyally first.
     */
    private async deleteSingleResource(iri: string) {
        const prismaResource = await this.prismaClient.resource.findFirst({where: {iri: iri}});
        if (prismaResource === null) {
            throw new Error("Resource not found.");
        }

        await this.prismaClient.resource.delete({where: {id: prismaResource.id}});
        
        for (const storeId of Object.values(JSON.parse(prismaResource.dataStoreId))) {
            await this.storeModel.remove(this.storeModel.getById(storeId as string));
        }
    }

    private prismaResourceToResource(prismaResource: PrismaResource): BaseResource {
        return {
            iri: prismaResource.iri,
            types: [prismaResource.representationType],
            userMetadata: JSON.parse(prismaResource.userMetadata),
            metadata: {
                creationDate: prismaResource.createdAt,
                modificationDate: prismaResource.modifiedAt
            },
            dataStores: JSON.parse(prismaResource.dataStoreId)
        }
    }

    /**
     * Returns data about the package and its sub-resources.
     */
    async getPackage(iri: string, deep: boolean = false) {
        const prismaResource = await this.prismaClient.resource.findFirst({where: {iri: iri, representationType: LOCAL_PACKAGE}});
        if (prismaResource === null) {
            return null;
        }
        const packageResources = await this.prismaClient.resource.findMany({where: {parentResourceId: prismaResource!.id}});

        return {
            ...this.prismaResourceToResource(prismaResource!),
            subResources: packageResources.map(resource => this.prismaResourceToResource(resource)),
        }
    }

    /**
     * Creates resource of type LOCAL_PACKAGE.
     */
    createPackage(parentIri: string | null, iri: string, userMetadata: {}) {
        return this.createResource(parentIri, iri, LOCAL_PACKAGE, userMetadata);
    }

    /**
     * Copies package or resource by IRI to another package identified by parentIri.
     */
    async copyRecursively(iri: string, parentIri: string, userMetadata: {}) {
        const prismaParentResource = await this.prismaClient.resource.findFirst({where: {iri: parentIri}});
        if (prismaParentResource === null) {
            throw new Error("Parent resource not found.");
        }
            
        const copyResource = async (sourceIri: string, parentIri: string, newIri: string) => {
            const prismaResource = await this.prismaClient.resource.findFirst({where: {iri: sourceIri}});
            if (prismaResource === null) {
                throw new Error("Resource to copy not found.");
            }
            await this.createResource(parentIri, newIri, prismaResource.representationType, JSON.parse(prismaResource.userMetadata));
            const newDataStoreId = {} as Record<string, string>;
            for (const [key, store] of Object.entries(JSON.parse(prismaResource.dataStoreId))) {
                const newStore = await this.storeModel.create();
                newDataStoreId[key] = newStore.uuid;
                
                const contents = await storeModel.getModelStore(store as string).getString();
                await this.storeModel.getModelStore(newStore.uuid).setString(contents);
            }
            await this.prismaClient.resource.update({
                where: {iri: newIri},
                data: {
                    dataStoreId: JSON.stringify(newDataStoreId)
                }
            });

            // Copy children
            if (prismaResource.representationType === LOCAL_PACKAGE) {
                const subResources = await this.prismaClient.resource.findMany({where: {parentResourceId: prismaResource.id}});
                for (const subResource of subResources) {
                    await copyResource(subResource.iri, newIri, newIri + "/" + uuidv4());
                }
            }
        }

        // Copy the root
        await copyResource(iri, parentIri, uuidv4());

        await this.updateModificationTimeById(prismaParentResource.id);
    }

    /**
     * Low level function to create a resource.
     * If parent IRI is null, the resource is created as root resource.
     */
    async createResource(parentIri: string | null, iri: string, type: string, userMetadata: {}) {
        let parentResourceId: number | null = null;

        if (parentIri !== null) {
            const parentRow = await this.prismaClient.resource.findFirst({select: {id: true}, where: {iri: parentIri, representationType: LOCAL_PACKAGE}});
            if (parentRow === null) {
                throw new Error("Cannot create resource because the parent package not found or is not a package.");
            }

            parentResourceId = parentRow.id;
        }

        // Test if the resource already exists
        const existingResource = await this.prismaClient.resource.findFirst({where: {iri: iri}});
        if (existingResource !== null) {
            throw new Error("Cannot create resource because it already exists.");
        }

        await this.prismaClient.resource.create({
            data: {
                iri: iri,
                parentResourceId: parentResourceId,
                representationType: type,
                userMetadata: JSON.stringify(userMetadata)
            }
        });

        if (parentResourceId !== null) {
            await this.updateModificationTimeById(parentResourceId);
        }
    }

    async getResourceModelStore(iri: string, storeName: string = "model"): Promise<ModelStore | null> {
        const prismaResource = await this.prismaClient.resource.findFirst({where: {iri: iri}});
        if (prismaResource === null) {
            throw new Error("Resource not found.");
        }

        const onUpdate = () => this.updateModificationTime(iri);
        
        const dataStoreId = JSON.parse(prismaResource.dataStoreId);

        if (dataStoreId[storeName]) {
            return this.storeModel.getModelStore(dataStoreId[storeName], [onUpdate]);
        } else {
            return null;
        }  
    }

    async getOrCreateResourceModelStore(iri: string, storeName: string = "model"): Promise<ModelStore> {
        const prismaResource = await this.prismaClient.resource.findFirst({where: {iri: iri}});
        if (prismaResource === null) {
            throw new Error("Resource not found.");
        }

        const onUpdate = () => this.updateModificationTime(iri);
        
        const dataStoreId = JSON.parse(prismaResource.dataStoreId);

        if (dataStoreId[storeName]) {
            return this.storeModel.getModelStore(dataStoreId[storeName], [onUpdate]);
        } else {
            const store = await this.storeModel.create();
            dataStoreId[storeName] = store.uuid;
            await this.prismaClient.resource.update({
                where: {id: prismaResource.id},
                data: {
                    dataStoreId: JSON.stringify(dataStoreId)
                }
            });
            return this.storeModel.getModelStore(store.uuid, [onUpdate]);
        }
    }

    async deleteModelStore(iri: string, storeName: string = "model") {
        const prismaResource = await this.prismaClient.resource.findFirst({where: {iri: iri}});
        if (prismaResource === null) {
            throw new Error("Resource not found.");
        }
        
        const dataStoreId = JSON.parse(prismaResource.dataStoreId);

        if (!dataStoreId[storeName]) {
            throw new Error("Store not found.");
        }

        await this.storeModel.remove(this.storeModel.getById(dataStoreId[storeName]));

        delete dataStoreId[storeName];

        await this.prismaClient.resource.update({
            where: {id: prismaResource.id},
            data: {
                dataStoreId: JSON.stringify(dataStoreId)
            }
        });

        await this.updateModificationTime(iri);
    }

    /**
     * @internal for importing resources
     */
    async assignExistingStoreToResource(iri: string, storeId: string, storeName: string = "model") {
        const prismaResource = await this.prismaClient.resource.findFirst({where: {iri: iri}});
        if (prismaResource === null) {
            throw new Error("Resource not found.");
        }

        const dataStoreId = JSON.parse(prismaResource.dataStoreId);
        dataStoreId[storeName] = storeId;
        await this.prismaClient.resource.update({
            where: {id: prismaResource.id},
            data: {
                dataStoreId: JSON.stringify(dataStoreId)
            }
        });

        await this.updateModificationTime(iri);
    }

    /**
     * Updates modification time of the resource and all its parent packages.
     * @param iri 
     */
    async updateModificationTime(iri: string) {
        const prismaResource = await this.prismaClient.resource.findFirst({where: {iri: iri}});
        if (prismaResource === null) {
            throw new Error("Cannot update modification time. Resource does not exists.");
        }

        let id: number | null = prismaResource.id;
        await this.updateModificationTimeById(id);
    }

    private async updateModificationTimeById(id: number) {
        while (id !== null) {
            await this.prismaClient.resource.update({
                where: {id},
                data: {
                    modifiedAt: new Date(),
                }
            });

            const parent = await this.prismaClient.resource.findFirst({select: {parentResourceId: true}, where: {id}}) as any; // It was causing TS7022 error
            id = parent?.parentResourceId ?? null;
        }
    }   
}
