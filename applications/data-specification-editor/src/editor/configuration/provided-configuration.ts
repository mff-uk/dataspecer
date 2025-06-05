import { DataSpecification, StructureEditorBackendService } from "@dataspecer/backend-utils/connectors/specification";
import { HttpSynchronizedStore } from "@dataspecer/backend-utils/stores";
import { Entities, Entity, EntityModel } from "@dataspecer/core-v2";
import { SemanticModelAggregator } from "@dataspecer/core-v2/hierarchical-semantic-aggregator";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { CoreResourceReader, MemoryStore } from "@dataspecer/core/core/index";
import { dataPsmExecutors } from "@dataspecer/core/data-psm/data-psm-executors";
import { DataPsmCreateSchema } from "@dataspecer/core/data-psm/operation/data-psm-create-schema";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { loadDataSpecifications } from "@dataspecer/specification/specification";
import { ClientConfigurator, DefaultClientConfiguration } from "../../configuration";
import { FrontendModelRepository } from "../../manager/utils/model-repository";
import { OperationContext } from "../operations/context/operation-context";
import { Configuration, ModelCompositionConfiguration } from "./configuration";
import { SemanticModelAggregatorBuilder } from "./semantic-model-aggregator-builder";

export const backendPackageService = new StructureEditorBackendService(import.meta.env.VITE_BACKEND as string, httpFetch, "http://dataspecer.com/packages/local-root");
export const modelRepository = new FrontendModelRepository(backendPackageService);

class SemanticModelAggregatorUnwrapped implements EntityModel {
  aggregator: SemanticModelAggregator;
  id: string;
  constructor(aggregator: SemanticModelAggregator, id: string) {
    this.aggregator = aggregator;
    this.id = id;
  }
  getEntities(): Entities {
    return Object.fromEntries(Object.entries(this.aggregator.getAggregatedEntities()).map(([key, value]) => [key, value.aggregatedEntity]));
  }
  subscribeToChanges(callback: (updated: Record<string, Entity>, removed: string[]) => void) {
    this.aggregator.subscribeToChanges((updated, removed) => {
      callback(Object.fromEntries(Object.entries(updated).map(([key, value]) => [key, value.aggregatedEntity])), removed);
    });
    return () => {};
  }
  getId(): string {
    return this.id;
  }
  getAlias(): string | null {
    throw new Error("Method not implemented.");
  }
  setAlias(alias: string | null): void {
    throw new Error("Method not implemented.");
  }

  executeOperation(operation: any) {
    return this.aggregator.execOperation(operation);
  }
}

/**
 * Based on the package iri and schema iri provides the full configuration which
 * includes everything needed to work with the specification.
 */
export async function provideConfiguration(dataSpecificationIri: string | null, dataPsmSchemaIri: string | null): Promise<Configuration> {
  const store = new FederatedObservableStore();

  let specifications: Record<string, DataSpecification>;
  let semanticModelAggregator: SemanticModelAggregator;

  if (dataSpecificationIri) {
    specifications = await loadDataSpecifications(dataSpecificationIri, modelRepository);

    for (const specification of Object.values(specifications)) {
      const { semanticModel, psmStores, usedSemanticModels } = await getStoresFromSpecification(specification);
      semanticModelAggregator = semanticModel;
      const storeForFBS = new SemanticModelAggregatorUnwrapped(semanticModel, specification.id) as unknown as CoreResourceReader;
      store.addStore(storeForFBS); // todo typings
      for (const model of usedSemanticModels) {
        store.addEventListener("afterOperationExecuted", () => backendPackageService.updateSingleModel(model));
      }
      for (const model of psmStores) {
        store.addStore(model);
        store.addEventListener("afterOperationExecuted", () => model.save());
      }
      // @ts-ignore Each specification should have its own semantic model, not merged with other specifications
      specification.semanticModel = semanticModel;
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
      [defaultDataSpecification.iri]: defaultDataSpecification,
    };
    dataSpecificationIri = defaultDataSpecification.iri;

    // @ts-ignore
    store.addStore(semanticModel);
    store.addStore(memoryStore);
  }

  const configurationForContext = ClientConfigurator.merge(
    DefaultClientConfiguration,
    ClientConfigurator.getFromObject(specifications[dataSpecificationIri].userPreferences)
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

async function getStoresFromSpecification(specification: DataSpecification) {
  let compositionConfiguration = specification.modelCompositionConfiguration as ModelCompositionConfiguration | null;
  const descriptors = backendPackageService.getStoreDescriptorsForDataSpecification(specification);

  let semanticModel: SemanticModelAggregator;
  let usedSemanticModels: InMemorySemanticModel[] = [];
  if (compositionConfiguration) {
    const builder = new SemanticModelAggregatorBuilder(backendPackageService, specification.id);
    semanticModel = await builder.build(compositionConfiguration);
    window["semanticModel"] = semanticModel;
    usedSemanticModels = builder.getUsedEntityModels();
  } else {
    throw new Error("No composition configuration found.");
  }

  const psmStoresDescriptor = Object.values(descriptors.psmStores).flat();
  const psmStores: HttpSynchronizedStore[] = [];
  for (const descriptor of psmStoresDescriptor) {
    const store = HttpSynchronizedStore.createFromDescriptor(descriptor, httpFetch);
    await store.load();
    psmStores.push(store);
  }

  window["semanticModel"] = semanticModel;

  return {
    semanticModel,
    psmStores,
    usedSemanticModels,
  };
}
