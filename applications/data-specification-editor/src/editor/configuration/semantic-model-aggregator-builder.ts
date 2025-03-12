import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ModelCompositionConfiguration, ModelCompositionConfigurationApplicationProfile, ModelCompositionConfigurationCache, ModelCompositionConfigurationLegacy, ModelCompositionConfigurationMerge } from "./configuration";
import { VisualModelData } from "@dataspecer/core-v2/visual-model";
import { ModelIdentifier } from "../../../../../packages/core-v2/lib/visual-model/entity-model/entity-model";
import { ApplicationProfileAggregator } from "../semantic-aggregator/application-profile-aggregator";
import { MergeAggregator } from "../semantic-aggregator/merge-aggregator";
import { VocabularyAggregator } from "../semantic-aggregator/vocabulary-aggregator";
import { BackendPackageService } from "@dataspecer/core-v2/project";
import { getProvidedSourceSemanticModel } from "./source-semantic-model/adapter";
import { LegacySemanticModelAggregator } from "../semantic-aggregator/legacy-semantic-model-aggregator";
import { SemanticModelAggregator } from "../semantic-aggregator/interfaces";

function mergeIfNecessary(models: SemanticModelAggregator[]): SemanticModelAggregator {
  if (models.length === 1) {
    return models[0];
  } else {
    return new MergeAggregator(models);
  }
}

/**
 * Builder of the semantic model aggregator from the configuration.
 */
export class SemanticModelAggregatorBuilder {
  private knownModels: Record<string, InMemorySemanticModel>;
  private modelData: Record<ModelIdentifier, VisualModelData>;

  /**
   * Helper set to keep track of used models for the option to use all remaining models.
   */
  private usedModels: Set<InMemorySemanticModel>;
  private readonly backendPackageService: BackendPackageService;
  private readonly specificationId: string;

  constructor(backendPackageService: BackendPackageService, specificationId: string) {
    this.backendPackageService = backendPackageService;
    this.specificationId = specificationId;
  }

  async build(configuration: ModelCompositionConfiguration): Promise<SemanticModelAggregator> {
    const [models, visualModels] = await this.backendPackageService.constructSemanticModelPackageModels(this.specificationId);

    this.modelData = {};
    for (const visualModel of visualModels) {
      Object.assign(this.modelData, Object.fromEntries(visualModel.getModelsData()));
    }
    this.knownModels = Object.fromEntries(models.map((model) => [model.getId(), model])) as Record<string, InMemorySemanticModel>;
    this.usedModels = new Set();

    return this.buildRecursive(configuration);
  }

  getUsedEntityModels(): InMemorySemanticModel[] {
    return [...this.usedModels];
  }

  /**
   * This is temporary implementation of algorithm that will take all models and from the deepest ones starts creating aggregated models.
   */
  private async constructRestFromModels(models: InMemorySemanticModel[]) {
    const iris = models.map((model) => model.getId());
    iris.sort((a, b) => b.split("/").length - a.split("/").length);

    const knownAggregatorsForPrefixes: Record<string, SemanticModelAggregator> = {}; // ends with slash

    const processAllModelsWithPrefix = async (iri: string) => { // ends with slash
      const thisModels = models.filter((model) => model.getId().startsWith(iri) && !model.getId().substring(iri.length).includes("/"));
      let thisAggregators: SemanticModelAggregator[];
      if (iri === "") {
        thisAggregators = Object.entries(knownAggregatorsForPrefixes).filter(([prefix]) => prefix.match(/^[^\/]+\/[^\/]+\//s)).map(([_, model]) => model);
      } else {
        thisAggregators = Object.entries(knownAggregatorsForPrefixes).filter(([prefix]) => prefix.startsWith(iri) && !prefix.substring(iri.length, prefix.length - 1).includes("/")).map(([_, model]) => model);
      }

      const profile = thisModels.find((model) => model.getId().endsWith("/profile"));
      const thisModelsAggregatorsWithoutProfile = await Promise.all(thisModels.filter((model) => model !== profile).map((model) => this.buildRecursive(model.getId())));
      // Create merge model
      const mergeModel = mergeIfNecessary([...thisAggregators, ...thisModelsAggregatorsWithoutProfile]);

      let result: SemanticModelAggregator;
      if (profile) {
        result = new ApplicationProfileAggregator(profile, mergeModel);
        (result as ApplicationProfileAggregator).thisVocabularyChain["color"] = this.modelData[profile.getId() as string]?.color;
        result = mergeIfNecessary([result, mergeModel]);
      } else {
        result = mergeModel;
      }

      knownAggregatorsForPrefixes[iri] = result;
    }

    let lastDept = 100;
    for (const iri of iris) {
      const withoutLastSlash = iri.substring(0, iri.lastIndexOf("/") + 1);
      const depth = withoutLastSlash.split("/").length;
      if (depth !== lastDept) {
        lastDept = depth;
      }
      if (!knownAggregatorsForPrefixes[withoutLastSlash]) {
        await processAllModelsWithPrefix(withoutLastSlash);
      }
    }

    const lastAggregators = Object.entries(knownAggregatorsForPrefixes).filter(([prefix]) => prefix.split("/").length === lastDept).map(([_, model]) => model);
    return mergeIfNecessary(lastAggregators);
  }

  private async buildRecursive(configuration: ModelCompositionConfiguration): Promise<SemanticModelAggregator> {
    if (!configuration) {
      throw new Error("Configuration is not defined.");
    } else if (typeof configuration === "string") {
      const model = this.knownModels[configuration];
      this.usedModels.add(model);
      if (model.modelMetadata?.["caches"]) { // Some models may not have metadata
        const cimAdapter = await getProvidedSourceSemanticModel(model.modelMetadata["caches"], this.specificationId);
        const aggregator = new LegacySemanticModelAggregator(model, cimAdapter);
        aggregator.thisVocabularyChain["color"] = this.modelData[configuration]?.color;
        return aggregator;
      } else {
        const aggregator = new VocabularyAggregator(this.knownModels[configuration]);
        aggregator.thisVocabularyChain["color"] = this.modelData[configuration]?.color;
        return aggregator;
      }
    } else if (configuration.modelType === "application-profile") {
      const profileConfig = configuration as ModelCompositionConfigurationApplicationProfile;
      const model = this.knownModels[profileConfig.model as string];
      this.usedModels.add(model);
      const profiles = await this.buildRecursive(profileConfig.profiles);
      const aggregator = new ApplicationProfileAggregator(model, profiles, true).setCanAddEntities(profileConfig.canAddEntities ?? true).setCanModify(profileConfig.canModify ?? true);
      aggregator.thisVocabularyChain["color"] = this.modelData[profileConfig.model as string]?.color;
      return aggregator;
    } else if (configuration.modelType === "merge") {
      const mergeConfig = configuration as ModelCompositionConfigurationMerge;
      if (!mergeConfig.models) {
        // Use all remaining models
        const remainingModels = Object.values(this.knownModels).filter((model) =>
          [...this.usedModels].every((usedModel) => usedModel.getId() !== model.getId())
        ) as InMemorySemanticModel[];
        return await this.constructRestFromModels(remainingModels);
      } else {
        const models = await Promise.all(mergeConfig.models.map((model) => this.buildRecursive(model.model)));
        return new MergeAggregator(models);
      }
    } else if (configuration.modelType === "cache") {
      const cacheConfig = configuration as ModelCompositionConfigurationCache;
      if (typeof cacheConfig.caches === "object" && cacheConfig.caches.modelType === "legacy") {
        const legacyConfig = cacheConfig.caches as ModelCompositionConfigurationLegacy;

        const cimAdapter = await getProvidedSourceSemanticModel(legacyConfig.configuration, null);
        const cache = this.knownModels[cacheConfig.model as string];
        this.usedModels.add(cache);
        return new LegacySemanticModelAggregator(cache, cimAdapter);
      } else {
        throw new Error("Unsupported model type for semantic model aggregator builder.");
      }
    } else {
      console.error(configuration);
      throw new Error("Unsupported model type for semantic model aggregator builder.");
    }
  }
}
