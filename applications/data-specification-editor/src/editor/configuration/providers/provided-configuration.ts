import { useAsyncMemo } from "../../hooks/use-async-memo";
import { Configuration } from "../configuration";
import { provideConfiguration } from "../provided-configuration";

/**
 * Loads the configuration from the given IRIs and registers the stores properly
 * to be updated when modification occurs. This hook requires loaders that
 * decide how to load the configuration from the given IRIs.
 * @param dataSpecificationIri IRI of the whole specification
 * @param dataPsmSchemaIri IRI of the given PSM schema that will be updated
 */
export const useProvidedConfiguration = (dataSpecificationIri: string | null, dataPsmSchemaIri: string | null): Configuration | null => {
  const [configuration] = useAsyncMemo(() => provideConfiguration(dataSpecificationIri, dataPsmSchemaIri), [dataSpecificationIri, dataPsmSchemaIri]);
  return configuration;
};
