import {DataSpecification} from "@dataspecer/core/data-specification/model";
import {Prisma, PrismaClient} from "@prisma/client";
import {LocalStoreModel} from "./local-store-model";
import {v4 as uuidv4} from "uuid";
import {PimCreateSchema} from "@dataspecer/core/pim/operation";
import {LocalStoreDescriptor} from "./local-store-descriptor";
import {DataSpecificationWithMetadata} from "@dataspecer/backend-utils/interfaces";
import {DataSpecificationWithStores} from "@dataspecer/backend-utils/interfaces";
import {DataPsmCreateSchema} from "@dataspecer/core/data-psm/operation";
import {UpdateDataSpecification} from "@dataspecer/backend-utils/interfaces";
import { copyStore } from "../utils/copy-store";

const prismaDataSpecificationConfig = {
  include: {
    dataStructures: true,
    importsDataSpecifications: true,
  }
};

type prismaDataSpecification =
  Prisma.DataSpecificationGetPayload<typeof prismaDataSpecificationConfig>;

/**
 * Manages data specifications, its data structures and store handlers.
 *
 * Due to the simplification, this class also serves as the interlayer between
 * the application and the Prisma framework.
 */
export class DataSpecificationModel {
  private readonly storeModel: LocalStoreModel;
  private readonly prismaClient: PrismaClient;
  private readonly iriTemplate: string;

  /**
   * @param storeModel
   * @param prismaClient
   * @param iriTemplate Specifies template for creating IRI for data
   * specification. The template must contain a placeholder "{}" for the
   * variable part.
   */
  constructor(storeModel: LocalStoreModel, prismaClient: PrismaClient, iriTemplate: string) {
    this.storeModel = storeModel;
    this.prismaClient = prismaClient;
    this.iriTemplate = iriTemplate;
  }

  private getDataSpecificationFromPrisma(dataSpecification: prismaDataSpecification): DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores {
    return {
      iri: dataSpecification.id,
      pim: dataSpecification.pimSchema,
      psms: dataSpecification.dataStructures.map(dataStructure => dataStructure.psmSchema),
      importsDataSpecifications: dataSpecification.importsDataSpecifications.map(importDataSpecification => importDataSpecification.id),
      artefacts: [],
      artefactConfiguration: JSON.parse(dataSpecification.artifactsConfiguration),
      pimStores: [
        this.storeModel.getById(dataSpecification.storeId)
      ],
      psmStores: Object.fromEntries(dataSpecification.dataStructures.map(dataStructure => [dataStructure.psmSchema, [this.storeModel.getById(dataStructure.storeId)]])),
      tags: JSON.parse(dataSpecification.tags) as string[],
      type: dataSpecification.type as DataSpecification["type"],
      cimAdapters: JSON.parse(dataSpecification.cimAdapters) as DataSpecification["cimAdapters"],
    }
  }

  public async getAllDataSpecifications(): Promise<(DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores)[]> {
    const result = await this.prismaClient.dataSpecification.findMany(prismaDataSpecificationConfig);
    return result.map((prismaDataSpecification) =>
      this.getDataSpecificationFromPrisma(prismaDataSpecification)
    );
  }

  public async getDataSpecification(dataSpecificationIri: string): Promise<(DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores)|null> {
    const result = await this.prismaClient.dataSpecification.findUnique({
      where: {
        id: dataSpecificationIri,
      },
      ...prismaDataSpecificationConfig
    });
    return result ? this.getDataSpecificationFromPrisma(result) : null;
  }

  public async createDataSpecification(): Promise<DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores> {
    // Create store for PIM schema and its elements
    const storeDescriptor = await this.storeModel.create();
    const store = await LocalStoreDescriptor.construct(storeDescriptor, this.storeModel);

    // Create schema
    await store.loadStore();
    const createSchema = new PimCreateSchema();
    const result = await store.applyOperation(createSchema);
    const pimSchema = result.created[0];
    await store.saveStore();

    const id = this.iriTemplate.replace("{}", uuidv4());
    const prismaDataSpecification = await this.prismaClient.dataSpecification.create({
      data: {
        id,
        pimSchema,
        storeId: storeDescriptor.uuid,
      },
      ...prismaDataSpecificationConfig
    });

    return this.getDataSpecificationFromPrisma(prismaDataSpecification);
  }

  public async restoreDataSpecification(iri: string, pimSchema: string, pimStoreUuid: string): Promise<DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores> {
    const prismaDataSpecification = await this.prismaClient.dataSpecification.create({
      data: {
        id: iri,
        pimSchema,
        storeId: pimStoreUuid,
      },
      ...prismaDataSpecificationConfig
    });

    return this.getDataSpecificationFromPrisma(prismaDataSpecification);
  }

  public async deleteDataSpecification(iri: string): Promise<boolean> {
    // Remove all data structures and their stores

    const allDataPsm = await this.prismaClient.dataStructure.findMany({
      where: {
        belongsToDataSpecification: {
          id: iri
        }
      }
    });

    allDataPsm.forEach(dataPsm => this.storeModel.remove(this.storeModel.getById(dataPsm.storeId)));

    await this.prismaClient.dataStructure.deleteMany({
      where: {
        belongsToDataSpecification: {
          id: iri,
        }
      }
    });

    // Remove the data specification itself

    try {
      const specification = await this.prismaClient.dataSpecification.delete({
        where: {
          id: iri,
        },
      });

      await this.storeModel.remove(this.storeModel.getById(specification.storeId));
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError){
        return false;
      } else {
        throw e;
      }
    }

    return true;
  }

  public async modifyDataSpecification(iri: string, dataSpecification: UpdateDataSpecification): Promise<DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores> {
    const prismaDataSpecification = await this.prismaClient.dataSpecification.update({
      where: {
        id: iri,
      },
      data: {
        importsDataSpecifications: dataSpecification.importsDataSpecifications ? {
          set: dataSpecification.importsDataSpecifications.map(iri => ({id: iri}))
        } : undefined,
        tags: dataSpecification.tags ? {
          set: JSON.stringify([...dataSpecification.tags])
        } : undefined,
        artifactsConfiguration: dataSpecification.artefactConfiguration ? {
          set: JSON.stringify(dataSpecification.artefactConfiguration)
        } : undefined,
        type: dataSpecification.type ? {
            set: String(dataSpecification.type)
        } : undefined,
        cimAdapters: dataSpecification.cimAdapters ? {
            set: JSON.stringify(dataSpecification.cimAdapters)
        } : undefined,
      },
      ...prismaDataSpecificationConfig
    });

    return this.getDataSpecificationFromPrisma(prismaDataSpecification);
  }

  public async createDataStructure(dataSpecificationIri: string): Promise<{
    dataSpecification: DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores,
    createdPsmSchemaIri: string,
  }> {
    const storeDescriptor = await this.storeModel.create();
    const store = await LocalStoreDescriptor.construct(storeDescriptor, this.storeModel);

    // Create schema
    await store.loadStore();
    const createSchema = new DataPsmCreateSchema();
    const result = await store.applyOperation(createSchema);
    const dataPsmSchema = result.created[0];
    await store.saveStore();

    await this.prismaClient.dataStructure.create({
      data: {
        id: uuidv4(),
        storeId: storeDescriptor.uuid,
        psmSchema: dataPsmSchema,
        belongsToDataSpecification: {
          connect: {
            id: dataSpecificationIri
          }
        },
      },
    });

    const dataSpecification = await this.prismaClient.dataSpecification.findUnique({
      where: {
        id: dataSpecificationIri,
      },
      ...prismaDataSpecificationConfig
    });

    if (!dataSpecification) {
      throw new Error("Data specification not found even though previous query did not throw an error");
    }

    return {
      dataSpecification: this.getDataSpecificationFromPrisma(dataSpecification),
      createdPsmSchemaIri: dataPsmSchema,
    }
  }

  /**
   * Inserts or sets the data structure.
   * @param dataSpecificationIri
   * @param dataStructure
   */
  public async restoreDataStructure(dataSpecificationIri: string, psmSchema: string, storeId: string) {
    const found = await this.prismaClient.dataStructure.findFirst({
      where: {
        belongsToDataSpecificationId: dataSpecificationIri,
        psmSchema,
      }
    });

    if (!found) {
      await this.prismaClient.dataStructure.create({
        data: {
          id: uuidv4(),
          storeId,
          psmSchema,
          belongsToDataSpecification: {
            connect: {
              id: dataSpecificationIri
            }
          },
        },
      });
    } else {
      await this.prismaClient.dataStructure.update({
        where: {
          id: found.id,
        },
        data: {
          storeId,
        }
      });
    }
  }

  public async deleteDataStructure(dataSpecificationIri: string, dataPsmSchemaIri: string): Promise<void> {
    const result = await this.prismaClient.dataStructure.delete({
      where: {
        psmSchema: dataPsmSchemaIri,
      },
    })
    await this.storeModel.remove(this.storeModel.getById(result.storeId));
  }

  public async clone(originalIri: string, dataSpecification: UpdateDataSpecification): Promise<DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores> {
    const original = await this.getDataSpecification(originalIri);
    if (!original) {
      throw new Error("Data specification not found");
    }
    let clone = await this.createDataSpecification();

    // Create empty map
    const map = new Map<string, string>();

    // Clone PIM store
    const originalPimStore = await LocalStoreDescriptor.construct(original.pimStores[0] as LocalStoreDescriptor, this.storeModel);
    const clonePimStore = await LocalStoreDescriptor.construct(clone.pimStores[0] as LocalStoreDescriptor, this.storeModel);
    map.set(original.pim!, clone.pim!);
    await originalPimStore.loadStore();
    copyStore(originalPimStore, clonePimStore, map);
    await clonePimStore.saveStore();

    // Clone PSM stores
    for (const psm of original.psms) {
      const originalPsmStore = await LocalStoreDescriptor.construct(original.psmStores[psm][0] as LocalStoreDescriptor, this.storeModel);

      clone = (await this.createDataStructure(clone.iri!)).dataSpecification;
      const newPsm = clone.psms[clone.psms.length - 1];
      map.set(psm, newPsm);

      const clonePsmStore = await LocalStoreDescriptor.construct(clone.psmStores[newPsm][0] as LocalStoreDescriptor, this.storeModel);
      await originalPsmStore.loadStore();
      copyStore(originalPsmStore, clonePsmStore, map);
      await clonePsmStore.saveStore();
    }

    // Clone the rest
    clone = await this.modifyDataSpecification(clone.iri!, {
      artefactConfiguration: original.artefactConfiguration,
      cimAdapters: original.cimAdapters,
      importsDataSpecifications: original.importsDataSpecifications,
      tags: original.tags,
      type: original.type,
      ...dataSpecification,
    });

    return clone;
  }
}
