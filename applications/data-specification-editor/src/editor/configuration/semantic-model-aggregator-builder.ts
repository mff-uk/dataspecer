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
      const aggregator = new ApplicationProfileAggregator(model, profiles);
      aggregator.thisVocabularyChain["color"] = this.modelData[profileConfig.model as string]?.color;
      return aggregator;
    } else if (configuration.modelType === "merge") {
      const mergeConfig = configuration as ModelCompositionConfigurationMerge;
      if (!mergeConfig.models) {
        // Use all remaining models
        const remainingModels = Object.values(this.knownModels).filter((model) =>
          [...this.usedModels].every((usedModel) => usedModel.getId() !== model.getId())
        ) as InMemorySemanticModel[];
        const vocabularyModels = await Promise.all(remainingModels.map(model => this.buildRecursive(model.getId())));
        return new MergeAggregator(vocabularyModels);
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
