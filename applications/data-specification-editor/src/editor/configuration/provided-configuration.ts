import { DataSpecification, StructureEditorBackendService } from "@dataspecer/backend-utils/connectors/specification";
import { HttpSynchronizedStore } from "@dataspecer/backend-utils/stores";
import { Entities, Entity, EntityModel } from "@dataspecer/core-v2";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { CoreResourceReader, MemoryStore } from "@dataspecer/core/core/index";
import { dataPsmExecutors } from "@dataspecer/core/data-psm/data-psm-executors";
import { DataPsmCreateSchema } from "@dataspecer/core/data-psm/operation/data-psm-create-schema";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { ClientConfigurator, DefaultClientConfiguration } from "../../configuration";
import { OperationContext } from "../operations/context/operation-context";
import { ApplicationProfileAggregator } from "../semantic-aggregator/application-profile-aggregator";
import { SemanticModelAggregator } from "../semantic-aggregator/interfaces";
import { LegacyL0Aggregator } from "../semantic-aggregator/l0-aggregator";
import { Configuration, SourceSemanticModelInterface } from "./configuration";
import { getProvidedSourceSemanticModel } from "./source-semantic-model/adapter";

const DEFAULT_CIM_ADAPTERS_CONFIGURATION = ["https://dataspecer.com/adapters/sgov"];
const backendPackageService = new StructureEditorBackendService(import.meta.env.VITE_BACKEND as string, httpFetch, "http://dataspecer.com/packages/local-root");

class SemanticModelAggregatorUnwrapped implements EntityModel {
    aggregator: SemanticModelAggregator;
    constructor(aggregator: SemanticModelAggregator) {
        this.aggregator = aggregator;
    }
    getEntities(): Entities {
        return Object.fromEntries(Object.entries(this.aggregator.getAggregatedEntities()).map(([key, value]) => [key, value.aggregatedEntity]));
    }
    subscribeToChanges(callback: (updated: Record<string, Entity>, removed: string[]) => void) {
        this.aggregator.subscribeToChanges((updated, removed) => {
            callback(
                Object.fromEntries(Object.entries(updated).map(([key, value]) => [key, value.aggregatedEntity])),
                removed
            );
        })
        return () => {};
    }
    getId(): string {
        return "semantic model aggregator";
    }
    getAlias(): string | null {
        throw new Error("Method not implemented.");
    }
    setAlias(alias: string | null): void {
        throw new Error("Method not implemented.");
    }
}

/**
 * Based on the package iri and schema iri provides the full configuration.
 */
export async function provideConfiguration(dataSpecificationIri: string | null, dataPsmSchemaIri: string | null): Promise<Configuration> {
  const store = new FederatedObservableStore();

  let specifications: Record<string, DataSpecification>;
  let semanticModelAggregator: SemanticModelAggregator;

  if (dataSpecificationIri) {
    specifications = await loadDataSpecifications(dataSpecificationIri);

    const cimAdaptersConfiguration = specifications?.[dataSpecificationIri]?.sourceSemanticModelIds ?? DEFAULT_CIM_ADAPTERS_CONFIGURATION;
    const sourceSemanticModel = await getProvidedSourceSemanticModel(cimAdaptersConfiguration, dataSpecificationIri);

    for (const specification of Object.values(specifications)) {
      const { semanticModels, psmStores, aggregatedSemanticModel } = await getStoresFromSpecification(specification, sourceSemanticModel);
      semanticModelAggregator = aggregatedSemanticModel;
      window["sm"] = semanticModelAggregator;
      const storeForFBS = new SemanticModelAggregatorUnwrapped(aggregatedSemanticModel) as unknown as CoreResourceReader;
      window["ss"] = storeForFBS;
      store.addStore(storeForFBS); // todo typings
      for (const model of semanticModels) {
        store.addEventListener("afterOperationExecuted", () => backendPackageService.updateSingleModel(model));
      }
      for (const model of psmStores) {
        store.addStore(model);
        store.addEventListener("afterOperationExecuted", () => model.save());
      }
    }

    // Load configuration
    const configurationStore = specifications?.[dataSpecificationIri]?.artifactConfigurations?.[0]?.id ?? null;
    const configuration = configurationStore ? ((await backendPackageService.getResourceJsonData(configurationStore)) as Record<string, object>) : {};

    if (specifications?.[dataSpecificationIri]) {
      // @ts-ignore
      specifications[dataSpecificationIri].artefactConfiguration = configuration;
    }
  } else {
    const semanticModel = new InMemorySemanticModel();

    const memoryStore = MemoryStore.create("https://ofn.gov.cz", [...dataPsmExecutors]); // For PSM classes

    const createDataPsmSchema = new DataPsmCreateSchema();
    const createDataPsmSchemaResult = await memoryStore.applyOperation(createDataPsmSchema);
    dataPsmSchemaIri = createDataPsmSchemaResult.created[0];

    const defaultDataSpecification = {
      id: "http://default-data-specification",
      type: "todo",
      label: {},
      tags: [],
      sourceSemanticModelIds: [],
      localSemanticModelIds: [semanticModel.getId()],
      dataStructures: [
        {
          id: dataPsmSchemaIri,
          label: {},
        },
      ],
      importsDataSpecificationIds: [],
      artifactConfigurations: [],
      userPreferences: {},
    } as DataSpecification;

    specifications = {
      [defaultDataSpecification.iri]: defaultDataSpecification
    };
    dataSpecificationIri = defaultDataSpecification.iri;

    // @ts-ignore
    store.addStore(semanticModel);
    store.addStore(memoryStore);
  }

  const configurationForContext = ClientConfigurator.merge(
    DefaultClientConfiguration,
    ClientConfigurator.getFromObject({}) // todo specification?.artefactConfiguration
  );
  const operationContext = new OperationContext();
  operationContext.labelRules = {
    languages: [configurationForContext.technicalLabelLanguages],
    namingConvention: configurationForContext.technicalLabelCasingConvention,
    specialCharacters: configurationForContext.technicalLabelSpecialCharacters,
  };

  return {
    // Aggregator of semantic model and PSM
    store: store as FederatedObservableStore,

    dataSpecifications: specifications,
    dataSpecificationIri: dataSpecificationIri,
    dataPsmSchemaIri: dataPsmSchemaIri,
    operationContext,
    // new cim + pim
    semanticModelAggregator,
};
}

async function loadDataSpecifications(dataSpecificationIri: string): Promise<Record<string, DataSpecification>> {
  const dataSpecificationIrisToLoad = [dataSpecificationIri];
  const dataSpecifications: { [iri: string]: DataSpecification } = {};

  for (let i = 0; i < dataSpecificationIrisToLoad.length; i++) {
    const dataSpecificationIri = dataSpecificationIrisToLoad[i];
    // const dataSpecification = await connector.readDataSpecification(dataSpecificationIri);
    const dataSpecification = await backendPackageService.getDataSpecification(dataSpecificationIri);
    if (dataSpecification) {
      dataSpecifications[dataSpecificationIri] = dataSpecification;
      dataSpecification.importsDataSpecificationIds.forEach((importIri) => {
        if (!dataSpecificationIrisToLoad.includes(importIri)) {
          dataSpecificationIrisToLoad.push(importIri);
        }
      });
    }
  }

  return dataSpecifications;
}

async function getStoresFromSpecification(specification: DataSpecification, sourceSemanticModel: SourceSemanticModelInterface) {
  const descriptors = backendPackageService.getStoreDescriptorsForDataSpecification(specification);
  const semanticModelDescriptors = descriptors.pimStores;
  const semanticModels: EntityModel[] = [];
  for (const descriptor of semanticModelDescriptors) {
    const [model] = await backendPackageService.constructSemanticModelFromIds([descriptor.modelId!]);
    semanticModels.push(model);
  }

  const psmStoresDescriptor = Object.values(descriptors.psmStores).flat();
  const psmStores: HttpSynchronizedStore[] = [];
  for (const descriptor of psmStoresDescriptor) {
    const store = HttpSynchronizedStore.createFromDescriptor(descriptor, httpFetch);
    await store.load();
    psmStores.push(store);
  }

  const cachedModel = new LegacyL0Aggregator(semanticModels[0] as InMemorySemanticModel, sourceSemanticModel);
  const profile = new ApplicationProfileAggregator(semanticModels[1] as InMemorySemanticModel, cachedModel);

  return {
    semanticModels,
    psmStores,
    aggregatedSemanticModel: profile,
  }
}
