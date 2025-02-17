import { StructureEditorBackendService } from "@dataspecer/backend-utils/connectors/specification";
import { wrapCimAdapter } from "@dataspecer/core-v2/semantic-model/simplified";
import { PrefixIriProvider } from "@dataspecer/core/cim/prefix-iri-provider";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { RdfsFileAdapter } from "@dataspecer/rdfs-adapter";
import { SgovAdapter } from "@dataspecer/sgov-adapter";
import { WikidataAdapter } from "@dataspecer/wikidata-experimental-adapter";
import { useAsyncMemo } from "../../hooks/use-async-memo";
import { SourceSemanticModelInterface } from "../configuration";
import { SourceSemanticModelFromEntityModels } from './source-semantic-model-adapter';

/**
 * Service to query backend under new v2 version.
 */
const service = new StructureEditorBackendService(
  import.meta.env.VITE_BACKEND,
  httpFetch,
  "http://dataspecer.com/packages/local-root"
);

const DEFAULT_CONFIG = [];

export const getAdapter = async (urls: string[], service: StructureEditorBackendService, dataSpecificationId: string | null = null) => {
  const iriProvider = new PrefixIriProvider();

  if (urls.length === 0 || (urls.length === 1 && urls[0] === "https://dataspecer.com/adapters/sgov")) {
    const cimAdapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
    cimAdapter.setIriProvider(iriProvider);
    return wrapCimAdapter(cimAdapter);
  }

  if (urls.length === 1 && urls[0] === "https://dataspecer.com/adapters/wikidata") {
    const cimAdapter = new WikidataAdapter(httpFetch, import.meta.env.VITE_WIKIDATA_ONTOLOGY_BACKEND);
    cimAdapter.setIriProvider(iriProvider);
    return wrapCimAdapter(cimAdapter);
  }

  if (urls.length === 1 && urls[0] === "https://dataspecer.com/adapters/sgov-en") {
    const cimAdapter = new SgovAdapter("https://er2023.dataspecer.com/sparql", httpFetch);
    cimAdapter.setIriProvider(iriProvider);
    return wrapCimAdapter(cimAdapter);
  }

  if (urls.every((url) => url.startsWith("rdfs:"))) {
    const cimAdapter = new RdfsFileAdapter(urls.map(url => url.substring("rdfs:".length)), httpFetch);
    cimAdapter.setIriProvider(iriProvider);
    return wrapCimAdapter(cimAdapter);
  }

  const [models] = await service.constructSemanticModelPackageModels(dataSpecificationId!);
  return new SourceSemanticModelFromEntityModels(urls, models);
};

/**
 * This hooks returns the configuration under the application should work.
 *
 * null means that the configuration is not yet loaded
 */
export function useProvidedSourceSemanticModel(
  cimAdaptersConfiguration: any[] = DEFAULT_CONFIG,
  dataSpecificationId: string | null
): SourceSemanticModelInterface | null {
  const [sourceSemanticModel] = useAsyncMemo(async () => {
    const adapter = await getAdapter(cimAdaptersConfiguration, service, dataSpecificationId) satisfies SourceSemanticModelInterface;
    return adapter;
  }, [cimAdaptersConfiguration, dataSpecificationId]);

  return sourceSemanticModel ?? null;
}

export function getProvidedSourceSemanticModel(
  cimAdaptersConfiguration: any[] = DEFAULT_CONFIG,
  dataSpecificationId: string | null
) {
  return getAdapter(cimAdaptersConfiguration, service, dataSpecificationId);
}