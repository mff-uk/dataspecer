export type ModelCompositionConfiguration =
  | string
  | {
      modelType: "merge" | "application-profile" | "cache";
    };

export type ModelCompositionConfigurationMerge = ModelCompositionConfiguration & {
  modelType: "merge";
  models: {
    model: ModelCompositionConfiguration;
  }[];
};

export type ModelCompositionConfigurationApplicationProfile = ModelCompositionConfiguration & {
  modelType: "application-profile";
  model: ModelCompositionConfiguration;
  profiles: ModelCompositionConfiguration;
  canAddEntities: boolean;
  canModify: boolean;
};

export type ModelCompositionConfigurationCache = ModelCompositionConfiguration & {
  modelType: "cache";
  model: ModelCompositionConfiguration;
  caches: ModelCompositionConfiguration;
};
