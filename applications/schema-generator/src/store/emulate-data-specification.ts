import {FederatedObservableStore} from "./federated-observable-store";
import {DataSpecification} from "@model-driven-data/core/data-specification/model";
import * as PSM from "@model-driven-data/core/data-psm/data-psm-vocabulary";
import * as PIM from "@model-driven-data/core/pim/pim-vocabulary";
import {GeneratorOptions} from "./generator-options";

/**
 * This is temporary function that converts data from
 * {@link FederatedObservableStore} to new format - array of
 * {@link DataSpecification} objects. In the future, this function will be
 * replaced by an API call to the backend.
 *
 * This only works for maximally one reused data specification.
 */
export async function getDataSpecificationsFromStore(
  store: FederatedObservableStore): Promise<
    [DataSpecification[],
    Record<string, GeneratorOptions>,
    string,
  ]> {

  const dataSpecifications = [new DataSpecification(), new DataSpecification()];
  const generatorOptions: [GeneratorOptions, GeneratorOptions] =
    [{requiredDataStructureSchemas: {}}, {requiredDataStructureSchemas: {}}]

  for (const storeWithMetadata of store.getStores()) {
    const isRoot = storeWithMetadata.metadata.tags.includes("root");
    const isPimNotPsm = storeWithMetadata.metadata.tags.includes("pim");
    const isJson = storeWithMetadata.metadata.artifacts?.includes("json") ?? false;
    const isXml = storeWithMetadata.metadata.artifacts?.includes("xml") ?? false;

    const schema = (await storeWithMetadata.store.listResourcesOfType((isPimNotPsm ? PIM : PSM).SCHEMA))[0];
    const schema_code = schema.substring(schema.lastIndexOf("/") + 1);

    const specification = dataSpecifications[isRoot ? 0 : 1];
    const generatorOption = generatorOptions[isRoot ? 0 : 1];

    // The logic
    if (isPimNotPsm) {
      specification.pim = schema;
      specification.iri = "https://ofn.gov.cz/data-specification/" + schema_code;
    } else { // psm
      specification.psms.push(schema);

      if (!generatorOption.requiredDataStructureSchemas[schema]) {
        generatorOption.requiredDataStructureSchemas[schema] = [];
      }

      if (isJson) {
        generatorOption.requiredDataStructureSchemas[schema].push("json");
      }
      if (isXml) {
        generatorOption.requiredDataStructureSchemas[schema].push("xml");
      }
    }
  }

  if (dataSpecifications[1].iri) {
    dataSpecifications[0].importsDataSpecifications.push(dataSpecifications[1].iri);
    return [
      dataSpecifications,
      {
        [dataSpecifications[0].iri as string]: generatorOptions[0],
        [dataSpecifications[1].iri as string]: generatorOptions[1],
      },
      dataSpecifications[0].iri as string,
    ]
  } else {
    return [
      [dataSpecifications[0]],
      {
        [dataSpecifications[0].iri as string]: generatorOptions[0],
      },
      dataSpecifications[0].iri as string,
    ]
  }
}
