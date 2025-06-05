import { ModelRepository } from "../model-repository/model-repository.ts";
import { getDataSpecification } from "./adapter.ts";
import { DataSpecification } from "./model.ts";

/**
 * Loads recursively all specifications necessary (it depends on them) for the given specification by its ID.
 */
export async function loadDataSpecifications(dataSpecificationIri: string, modelRepository: ModelRepository): Promise<Record<string, DataSpecification>> {
  const dataSpecificationIrisToLoad = [dataSpecificationIri];
  const dataSpecifications: { [iri: string]: DataSpecification } = {};

  for (let i = 0; i < dataSpecificationIrisToLoad.length; i++) {
    const dataSpecificationIri = dataSpecificationIrisToLoad[i]!;

    const model = await modelRepository.getModelById(dataSpecificationIri);
    const packageModel = await model?.asPackageModel();
    const dataSpecification = packageModel ? await getDataSpecification(packageModel) : undefined;

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