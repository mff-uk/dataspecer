import configuration from "../configuration.ts";
import { ResourceModel } from "./resource-model.ts";

export const ROOT_PACKAGE_FOR_V1 = configuration.v1RootIri;

export async function createV1RootModel(adapter: ResourceModel) {
  await adapter.createPackage(null, ROOT_PACKAGE_FOR_V1, configuration.v1RootIri === configuration.localRootIri ? configuration.localRootMetadata : configuration.v1RootMetadata);
}
