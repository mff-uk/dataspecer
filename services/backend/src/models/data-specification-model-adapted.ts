import { DataSpecificationWithMetadata, DataSpecificationWithStores, UpdateDataSpecification } from "@dataspecer/backend-utils/interfaces";
import { V1 } from "@dataspecer/core-v2/model/known-models";
import { DataPsmCreateSchema } from "@dataspecer/core/data-psm/operation";
import { DataSpecification } from "@dataspecer/core/data-specification/model";
import { PimCreateSchema } from "@dataspecer/core/pim/operation";
import { v4 as uuidv4 } from "uuid";
import { LocalStoreDescriptor } from "./local-store-descriptor";
import { LocalStoreModel } from "./local-store-model";
import { ResourceModel } from "./resource-model";
import configuration from "../configuration";
import { HttpStoreDescriptor } from "@dataspecer/backend-utils/store-descriptor";

export const ROOT_PACKAGE_FOR_V1 = configuration.v1RootIri;

export async function createV1RootModel(adapter: ResourceModel) {
  await adapter.createPackage(null, ROOT_PACKAGE_FOR_V1, configuration.v1RootMetadata);
}

export function replaceStoreDescriptorsInDataSpecification<T extends DataSpecificationWithStores>(dataSpecification: T): T {
  const blobApi = configuration.host + '/resources/blob?iri=';
  const pimStore = new HttpStoreDescriptor();
  pimStore.url = blobApi + encodeURIComponent(dataSpecification.pim!);
  pimStore.isReadOnly = false;

  const psmStores: Record<string, HttpStoreDescriptor[]> = {};
  for (const psm of dataSpecification.psms) {
      const store = new HttpStoreDescriptor();
      store.url = blobApi + encodeURIComponent(psm);
      store.isReadOnly = false;
      psmStores[psm] = [store];
  }

  return {
      ...dataSpecification,
      pimStores: [pimStore],
      psmStores: psmStores,
  }
}

/**
 * Manages data specifications, its data structures and store handlers.
 * It is build over v2 core.
 */
export class DataSpecificationModelAdapted {
  private readonly storeModel: LocalStoreModel;
  private readonly iriTemplate: string;
  private readonly resourceModel: ResourceModel;

  constructor(storeModel: LocalStoreModel, iriTemplate: string, resourceModel: ResourceModel) {
    this.storeModel = storeModel;
    this.iriTemplate = iriTemplate;
    this.resourceModel = resourceModel;
  }

  public async getAllDataSpecifications(): Promise<(DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores)[]> {
    const rootPackage = await this.resourceModel.getPackage(ROOT_PACKAGE_FOR_V1);

    const dataSpecifications = [];

    for (const child of rootPackage!.subResources) {
      const dataSpecification = await this.getDataSpecification(child.iri);
      if (dataSpecification) {
        dataSpecifications.push(dataSpecification);
      }
    }

    return dataSpecifications;
  }

  private async unpackDS(iri: string) {
    const dataSpecificationPackage = await this.resourceModel.getPackage(iri); // This is data specification
    if (!dataSpecificationPackage) {
      return null;
    }

    const cimResource = dataSpecificationPackage.subResources.find(subResource => subResource.types.includes(V1.CIM));
    const pimResource = dataSpecificationPackage.subResources.find(subResource => subResource.types.includes(V1.PIM));
    const psmResources = dataSpecificationPackage.subResources.filter(subResource => subResource.types.includes(V1.PSM));
    const generatorConfigurationResource = dataSpecificationPackage.subResources.find(subResource => subResource.types.includes(V1.GENERATOR_CONFIGURATION));

    if (!cimResource || !pimResource || !generatorConfigurationResource) {
      // This is not a valid data specification, nor it is an error. We just cannot interpret it.
      return null;
    }

    return {
      dataSpecificationPackage,
      cimResource,
      pimResource,
      psmResources,
      generatorConfigurationResource,
    }
  }

  public async getDataSpecification(dataSpecificationIri: string): Promise<(DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores)|null> {
    const unpacked = await this.unpackDS(dataSpecificationIri);
    if (!unpacked) {
      return null;
    }
    const {
      dataSpecificationPackage,
      cimResource,
      pimResource,
      psmResources,
      generatorConfigurationResource,
    } = unpacked;

    return {
      iri: dataSpecificationPackage.iri,
      pim: pimResource.iri,
      psms: dataSpecificationPackage!.subResources.filter(subResource => subResource.types.includes(V1.PSM)).map(subResource => subResource.iri),
      importsDataSpecifications: JSON.parse((await this.storeModel.get(dataSpecificationPackage.dataStores.model))!.toString()).dataStructuresImportPackages ?? [],
      artefacts: [],
      artefactConfiguration: JSON.parse((await this.storeModel.get(generatorConfigurationResource.dataStores.model))!.toString()),
      pimStores: [
        this.storeModel.getById(pimResource.dataStores.model)
      ],
      psmStores: Object.fromEntries(psmResources.map(psmResource => [psmResource.iri, [this.storeModel.getById(psmResource.dataStores.model)]])),
      tags: dataSpecificationPackage.userMetadata.tags ?? [],
      type: "http://dataspecer.com/vocabularies/data-specification/documentation",
      cimAdapters: JSON.parse((await this.storeModel.get(cimResource.dataStores.model))!.toString()).models ?? [],
    };
  }

  public async createDataSpecification(forceIri?: string, forcePimSchema?: string, forceStoreUuid?: string): Promise<DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores> {
    const iri = forceIri ?? this.iriTemplate.replace("{}", uuidv4());

    // Data specification
    await this.resourceModel.createPackage(ROOT_PACKAGE_FOR_V1, iri, {});

    let pimSchema = forcePimSchema!;
    let pimStoreUuid = forceStoreUuid!;
    if (!forcePimSchema) {
      // Create store for PIM schema and its elements
      const storeDescriptor = await this.storeModel.create();
      const store = await LocalStoreDescriptor.construct(storeDescriptor, this.storeModel);
  
      // Create schema
      await store.loadStore();
      const createSchema = new PimCreateSchema();
      const result = await store.applyOperation(createSchema);
      pimSchema = result.created[0];
      await store.saveStore();

      pimStoreUuid = storeDescriptor.uuid;
    }

    // Create package model
    await (await this.resourceModel.getOrCreateResourceModelStore(iri)).setJson({});


    // Create generator configuration
    await this.resourceModel.createResource(iri, iri + "/default-generator-configuration", V1.GENERATOR_CONFIGURATION, {});
    await (await this.resourceModel.getOrCreateResourceModelStore(iri + "/default-generator-configuration")).setJson({});

    // Create CIM
    await this.resourceModel.createResource(iri, iri + "/cim", V1.CIM, {});
    await (await this.resourceModel.getOrCreateResourceModelStore(iri + "/cim")).setJson({models: []});

    // Create rest of PIM
    await this.resourceModel.createResource(iri, pimSchema, V1.PIM, {});
    await this.resourceModel.assignExistingStoreToResource(pimSchema, pimStoreUuid);

    return (await this.getDataSpecification(iri))!;
  }

  public async restoreDataSpecification(iri: string, pimSchema: string, pimStoreUuid: string): Promise<DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores> {   
    return this.createDataSpecification(iri, pimSchema, pimStoreUuid);
  }

  public async deleteDataSpecification(iri: string): Promise<boolean> {
    await this.resourceModel.deleteResource(iri);
    return true;
  }


  public async modifyDataSpecification(iri: string, dataSpecification: UpdateDataSpecification): Promise<DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores> {
    const unpacked = await this.unpackDS(iri);
    if (!unpacked) {
      throw new Error("Data specification is not valid");
    }
    const {
      dataSpecificationPackage,
      cimResource,
      pimResource,
      psmResources,
      generatorConfigurationResource,
    } = unpacked;

    if (dataSpecification.importsDataSpecifications) {
      const dsModel = JSON.parse((await this.storeModel.get(dataSpecificationPackage.dataStores.model))?.toString()!);
      await this.storeModel.set(dataSpecificationPackage.dataStores.model, JSON.stringify({
        ...dsModel,
        dataStructuresImportPackages: dataSpecification.importsDataSpecifications,
      }));
    }

    if (dataSpecification.tags) {
      await this.resourceModel.updateResource(iri, {...dataSpecificationPackage.userMetadata, tags: dataSpecification.tags});
    }

    if (dataSpecification.artefactConfiguration) {
      await this.storeModel.set(generatorConfigurationResource.dataStores.model, JSON.stringify(dataSpecification.artefactConfiguration));
    }

    if (dataSpecification.type) {
      //throw new Error("Not implemented.");
    }

    if (dataSpecification.cimAdapters) {
      const modelStore = await this.storeModel.getModelStore(cimResource.dataStores.model);
      await modelStore.setJson({
        ...await modelStore.getJson(),
        models: dataSpecification.cimAdapters,
      });
    }

    return (await this.getDataSpecification(iri))!;
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

    await this.resourceModel.createResource(dataSpecificationIri, dataPsmSchema, V1.PSM, {});
    await this.resourceModel.assignExistingStoreToResource(dataPsmSchema, storeDescriptor.uuid);

    return {
      dataSpecification: (await this.getDataSpecification(dataSpecificationIri))!,
      createdPsmSchemaIri: dataPsmSchema,
    }
  }

  public async restoreDataStructure(dataSpecificationIri: string, psmSchema: string, storeId: string) {
    const found = await this.resourceModel.getResource(psmSchema);

    if (!found) {
      await this.resourceModel.createResource(dataSpecificationIri, psmSchema, V1.PSM, {});
    }
    await this.resourceModel.assignExistingStoreToResource(psmSchema, storeId);
  }

  public async deleteDataStructure(dataSpecificationIri: string, dataPsmSchemaIri: string): Promise<void> {
    await this.resourceModel.deleteResource(dataPsmSchemaIri);
  }

  public async clone(originalIri: string, dataSpecification: UpdateDataSpecification): Promise<DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores> {
    throw new Error("Not implemented.");
  }
}
