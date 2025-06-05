import { LOCAL_PACKAGE, V1 } from "@dataspecer/core-v2/model/known-models";
import { PackageModel } from "../model-repository/package-model.ts";
import { DataSpecification } from "./model.ts";
import { DataSpecification as LegacyDataSpecification } from "@dataspecer/core/data-specification/model";
import { BaseResource, Package } from "@dataspecer/core-v2/project";

export async function getDataSpecification(packageAsSpecification: PackageModel): Promise<DataSpecification> {
  const subResources = await packageAsSpecification.getSubResources();

  const dataStructures = subResources
    .filter((r) => r.types.includes(V1.PSM))
    .map((ds) => ({
      id: ds.id,
      label: ds.getUserMetadata()?.label || {},
    }));

  const artifactConfigurations = subResources
    .filter((r) => r.types.includes(V1.GENERATOR_CONFIGURATION))
    .map((ds) => ({
      id: ds.id,
      label: ds.getUserMetadata()?.label || {},
    }));

  const model = (await packageAsSpecification.getJsonBlob() as any) ?? {};

  return {
    ...await serializePackageModel(packageAsSpecification),
    id: packageAsSpecification.id,
    type: LegacyDataSpecification.TYPE_DOCUMENTATION,

    label: packageAsSpecification.getUserMetadata()?.label || {},
    tags: [], // todo

    sourceSemanticModelIds: model.sourceSemanticModelIds ?? ["https://dataspecer.com/adapters/sgov"], // SGOV is default model if none is selected
    localSemanticModelIds: model.localSemanticModelIds ?? [],
    modelCompositionConfiguration: model.modelCompositionConfiguration ?? null,
    dataStructures,
    importsDataSpecificationIds: model.dataStructuresImportPackages ?? [],

    artifactConfigurations,

    userPreferences: model.userPreferences ?? {},
  };
}

async function serializePackageModel(packageModel: PackageModel): Promise<Package> {
  const subResources = [];
  for (const subResource of await packageModel.getSubResources()) {
    if (subResource.types.includes(LOCAL_PACKAGE)) {
      subResources.push(await serializePackageModel(await subResource.asPackageModel()));
    } else {
      subResources.push({
        iri: subResource.id,
        types: subResource.types,
        userMetadata: subResource.getUserMetadata() || {},
        metadata: null as any, // Metadata is not serialized in this context
      } as BaseResource);
    }
  }

  return {
    iri: packageModel.id,
    types: packageModel.types,
    userMetadata: packageModel.getUserMetadata() || {},
    metadata: null as any,

    subResources
  }

}
