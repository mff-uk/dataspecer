import { HttpStoreDescriptor, StoreDescriptor } from "../../store-descriptor";
import { EntityModel } from "@dataspecer/core-v2";
import { LOCAL_SEMANTIC_MODEL, V1 } from "@dataspecer/core-v2/model/known-models";
import { BackendPackageService, Package } from "@dataspecer/core-v2/project";
import { CoreResource, LanguageString } from "@dataspecer/core/core/core-resource";
import { DataSpecification as LegacyDataSpecification } from "@dataspecer/core/data-specification/model";
import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";

export type DataSpecification = Package & {
  /**
   * ID of the parent package that is being interpreted as Data Specification.
   */
  id: string;

  type: string;

  label: LanguageString;
  tags: string[];

  /**
   * List of IDs of models that are being interpreted as CIMs.
   * */
  sourceSemanticModelIds: string[];

  /**
   * List of IDs of models that are being interpreted as PIMs.
   */
  localSemanticModelIds: string[];

  dataStructures: DataSpecificationStructure[];

  importsDataSpecificationIds: string[];

  /**
   * List of artifact configurations.
   */
  artifactConfigurations: ArtifactConfigurationDescriptor[];

  /**
   * Additional data that can be used to store user preferences.
   */
  userPreferences: object;
};

export type DataSpecificationStructure = {
  id: string;
  label: LanguageString;
}

export type ArtifactConfigurationDescriptor = {
  id: string;
  label: LanguageString;
}

export class HttpSemanticModelStoreDescriptor implements StoreDescriptor {
  static readonly TYPE = "https://schemas.dataspecer.com/store-descriptor/semantic-model/http";

  type: typeof HttpSemanticModelStoreDescriptor.TYPE;

  url: string | null = null;

  modelId: string | null = null;

  isReadOnly: boolean;

  constructor() {
    this.type = HttpSemanticModelStoreDescriptor.TYPE;
    this.isReadOnly = true;
    this.url = null;
  }

  static is(storeDescriptor: StoreDescriptor): storeDescriptor is HttpSemanticModelStoreDescriptor {
    return storeDescriptor.type === HttpSemanticModelStoreDescriptor.TYPE;
  }
}

/**
 * This serves as an extension to the BackendPackageService that adds methods for operations on data specifications in structure editor.
 */
export class StructureEditorBackendService extends BackendPackageService {
  /**
   * Default root package id under which all data specifications are created by default.
   */
  protected readonly packageRoot: string;

  constructor(backendUrl: string, httpFetch: HttpFetch, packageRoot: string) {
    super(backendUrl, httpFetch);
    this.packageRoot = packageRoot;
  }

  public async readDefaultConfiguration(): Promise<object> {
    const data = await this.httpFetch(this.backendUrl + "/default-configuration");
    return await data.json() as object;
  }

  /**
   * Returns extended information for given package that is being interpreted as Data Specification.
   * @param dataSpecificationId ID of the package that is being interpreted as Data Specification.
   */
  public async getDataSpecification(dataSpecificationId: string): Promise<DataSpecification & Package> {
    const pckg = await this.getPackage(dataSpecificationId)!;

    const dataStructures = pckg.subResources.filter(r => r.types.includes(V1.PSM)).map(ds => ({
      id: ds.iri,
      label: ds.userMetadata?.label || {},
    }));

    const artifactConfigurations = pckg.subResources.filter(r => r.types.includes(V1.GENERATOR_CONFIGURATION)).map(ds => ({
      id: ds.iri,
      label: ds.userMetadata?.label || {},
    }));

    const model = await this.getResourceJsonData(dataSpecificationId) as any ?? {};

    return {
      ...pckg,
      id: pckg.iri,
      type: LegacyDataSpecification.TYPE_DOCUMENTATION,

      label: pckg.userMetadata?.label || {},
      tags: pckg.userMetadata?.tags || [],

      sourceSemanticModelIds: model.sourceSemanticModelIds ?? ["https://dataspecer.com/adapters/sgov"], // SGOV is default model if none is selected
      localSemanticModelIds: model.localSemanticModelIds ?? [],
      dataStructures,
      importsDataSpecificationIds: model.dataStructuresImportPackages ?? [],

      artifactConfigurations,

      userPreferences: model.userPreferences ?? {},
    };
  }

  /**
   * Returns information on how to fetch models for given data specification.
   */
  public getStoreDescriptorsForDataSpecification(dataSpecification: DataSpecification) {
    const pimStores = dataSpecification.localSemanticModelIds.map(id => {
      const store = new HttpSemanticModelStoreDescriptor();
      store.isReadOnly = false;
      store.modelId = id;
      return store;
    });

    const psmStores = Object.fromEntries(dataSpecification.dataStructures.map(ds => {
      const store = new HttpStoreDescriptor();
      store.isReadOnly = false;
      store.url = this.backendUrl + '/resources/blob?iri=' + encodeURIComponent(ds.id);
      return [ds.id, [store]];
    }));

    return {
      pimStores,
      psmStores,
    }
  }

  public async updateImportedDataSpecifications(dataSpecificationId: string, importedDataSpecificationIds: string[]): Promise<void> {
    const model = await this.getResourceJsonData(dataSpecificationId) as any ?? {};
    model.dataStructuresImportPackages = importedDataSpecificationIds;
    await this.setResourceJsonData(dataSpecificationId, model);
  }

  public async updateLocalSemanticModelIds(dataSpecificationId: string, localSemanticModelIds: string[]): Promise<void> {
    const model = await this.getResourceJsonData(dataSpecificationId) as any ?? {};
    model.localSemanticModelIds = localSemanticModelIds;
    await this.setResourceJsonData(dataSpecificationId, model);
  }

  public async updateSourceSemanticModelIds(dataSpecificationId: string, sourceSemanticModelIds: string[]): Promise<void> {
    const model = await this.getResourceJsonData(dataSpecificationId) as any ?? {};
    model.sourceSemanticModelIds = sourceSemanticModelIds;
    await this.setResourceJsonData(dataSpecificationId, model);
  }

  public async updateSpecificationMetadata(dataSpecificationId: string, metadata: {label?: LanguageString, tags?: string[]}): Promise<DataSpecification & Package> {
    await this.updatePackage(dataSpecificationId, {
      userMetadata: metadata,
    });
    return this.getDataSpecification(dataSpecificationId);
  }

  public async getArtifactConfiguration(artifactConfigurationId: string): Promise<unknown> {
    return await this.getResourceJsonData(artifactConfigurationId);
  }

  public async updateArtifactConfiguration(artifactConfigurationId: string, configuration: object): Promise<void> {
    await this.setResourceJsonData(artifactConfigurationId, configuration);
  }

  /**
   * The last argument specifies whether the preferences should be overwritten or merged with the existing ones.
   * Default is merge.
   */
  public async updateUserPreferences(dataSpecificationId: string, preferences: object, overwrite: boolean = false): Promise<DataSpecification & Package> {
    const model = await this.getResourceJsonData(dataSpecificationId) as any ?? {};
    if (overwrite) {
      model.userPreferences = preferences;
    } else {
      model.userPreferences = {
        ...model.userPreferences,
        ...preferences,
      };
    }
    await this.setResourceJsonData(dataSpecificationId, model);
    return this.getDataSpecification(dataSpecificationId);
  }

  async constructSemanticModelFromIds(
    ids: string[]
  ): Promise<EntityModel[]> {
    const entityModels: EntityModel[] = [];
    for (const id of ids) {
      const resource = await this.getResource(id);
      const [[model]] = await this.getModelsFromResources([resource]);
      entityModels.push(model);
    }
    return entityModels;
  }

  // FROM LEGACY CONNECTOR

  public async doGarbageCollection(dataSpecificationIri: string): Promise<object | false> {
    const data = await fetch(this.backendUrl + "/data-specification/garbage-collection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecificationIri: dataSpecificationIri,
      }),
    });

    if (data.status !== 200) {
      throw new Error("Garbage collection failed");
    }

    return await data.json() as object;
  }

  public async doConsistencyFix(dataSpecificationIri: string): Promise<object | false> {
    const data = await fetch(this.backendUrl + "/data-specification/consistency-fix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecificationIri: dataSpecificationIri,
      }),
    });

    if (data.status !== 200) {
      throw new Error("Consistency fix failed");
    }

    return await data.json() as object;
  }

  /**
   * Creates new package with empty semantic model as PIM.
   */
  public async createDataSpecification(set: {tags?: string[], label?: LanguageString} = {}): Promise<DataSpecification & Package> {
    const pckg = await this.createPackage(this.packageRoot, {
      userMetadata: {
        tags: set.tags,
        label: set.label,
      }
    });

    const pim = await this.createResource(pckg.iri, {
      type: LOCAL_SEMANTIC_MODEL,
      userMetadata: {
        label: {
          "en": "PIM",
        },
      }
    });
    await this.setResourceJsonData(pim.iri, {
      "type": "http://dataspecer.com/resources/local/semantic-model",
      "modelId": pim.iri,
      "modelAlias": set?.label.en ?? set?.label.cs ?? "",
      "entities": {}
    });

    await this.setResourceJsonData(pckg.iri, {
      localSemanticModelIds: [pim.iri],
      sourceSemanticModelIds: ["https://dataspecer.com/adapters/sgov"],
    });

    const configuration = await this.createResource(pckg.iri, {
      type: V1.GENERATOR_CONFIGURATION,
      userMetadata: {
        label: {
          "en": "Artifact configuration",
        }
      }
    });
    await this.setResourceJsonData(configuration.iri, {});

    return this.getDataSpecification(pckg.iri);
  }

  public async cloneDataSpecification(dataSpecificationIri: string, metadata: {label?: LanguageString, tags?: string[]}): Promise<DataSpecification & Package> {
    await this.copyRecursively(dataSpecificationIri, this.packageRoot, metadata);
    return this.getDataSpecification(dataSpecificationIri);
  }

  public async deleteDataSpecification(dataSpecificationIri: string): Promise<void> {
    await fetch(this.backendUrl + "/data-specification", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecificationIri: dataSpecificationIri,
      }),
    });
  }

  public async createDataStructure(dataSpecificationIri: string): Promise<{
    dataSpecification: DataSpecification & Package,
    createdPsmSchemaIri: string,
  }> {
    const resource = await this.createResource(dataSpecificationIri, {
      type: V1.PSM,
    });

    await this.setResourceJsonData(resource.iri, {
      operations: [],
      resources: {
        [resource.iri]: {
          "types": [
              "https://ofn.gov.cz/slovník/psm/Schema"
          ],
          "iri": resource.iri,
          "dataPsmHumanLabel": null,
          "dataPsmHumanDescription": null,
          "dataPsmTechnicalLabel": null,
          "dataPsmRoots": [],
          "dataPsmParts": []
        }
      }
    });

    const dataSpecification = await this.getDataSpecification(dataSpecificationIri);
    return {
      dataSpecification,
      createdPsmSchemaIri: resource.iri,
    };
  }

  public async deleteDataStructure(dataSpecificationIri: string, dataPsmSchemaIri: string): Promise<void> {
    await fetch(this.backendUrl + "/data-specification/data-psm", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecificationIri,
        dataPsmSchemaIri,
      }),
    });
  }

  public async importSpecifications(dataSpecifications: Record<string, object>, specificationsToImport: Record<string, string>, store: Record<string, CoreResource>): Promise<void> {
    await fetch(this.backendUrl + "/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecifications,
        specificationsToImport,
        store,
      }),
    });
  }
}