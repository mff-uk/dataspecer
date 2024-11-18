import { CoreResourceReader } from "@dataspecer/core/core/core-reader";
import { DataSpecification, DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
import { Generator } from "@dataspecer/core/generator";
import { MemoryStreamDictionary } from "@dataspecer/core/io/stream/memory-stream-dictionary";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { getArtefactGenerators } from "../../../artefact-generators";
import { getDefaultConfigurators } from "../../../configurators";
import { DefaultArtifactConfigurator } from "../../../default-artifact-configurator";
import { DataSpecificationNameCell } from "../../../manager/name-cells";
import { DataSpecification as CoreDataSpecification } from "@dataspecer/core/data-specification/model";

/**
 * Returns a single generated artifact with its name based on the given artifact
 * definition.
 * @param store
 * @param forDataSpecificationIri
 * @param dataSpecifications
 * @param artifactSelector Function that returns true for the artifact
 * definition that should be generated.
 * @param configuration
 * @return [artifact content, filename]
 */
export async function getSingleArtifact(
  store: FederatedObservableStore,
  forDataSpecificationIri: string,
  dataSpecifications: { [key: string]: DataSpecification },
  artifactSelector: (artifact: DataSpecificationArtefact) => boolean,
  configuration: object,
): Promise<MemoryStreamDictionary> {
  // Generate artifacts definitions

  // todo: list of artifacts is generated in place by DefaultArtifactConfigurator
  const defaultArtifactConfigurator = new DefaultArtifactConfigurator(Object.values(dataSpecifications), store, configuration, getDefaultConfigurators());
  const dataSpecificationsWithArtifacts: typeof dataSpecifications = {};
  for (const dataSpecification of Object.values(dataSpecifications)) {
    dataSpecificationsWithArtifacts[dataSpecification.iri as string] = {
      ...dataSpecification,
      artefacts: await defaultArtifactConfigurator.generateFor(dataSpecification.iri as string),
    };
  }

  // Find the correct artifact

  const artefact = dataSpecificationsWithArtifacts[forDataSpecificationIri]
    ?.artefacts
    ?.find(artifactSelector);

  // Generate the artifact and return it

  // Convert data specification
  const ds = Object.values(dataSpecificationsWithArtifacts).map(specification => ({
    iri: specification.id,
    pim: specification.localSemanticModelIds[0],
    psms: specification.dataStructures.map(ds => ds.id),
    type: CoreDataSpecification.TYPE_DOCUMENTATION,
    importsDataSpecifications: specification.importsDataSpecificationIds,
    artefacts: specification.artefacts,
    // @ts-ignore
    artefactConfiguration: specification.artefactConfiguration,
    cimAdapters: [],
  })) as CoreDataSpecification[];

  const generator = new Generator(
      ds,
      store as CoreResourceReader,
      getArtefactGenerators());
  const dict = new MemoryStreamDictionary();
  await generator.generateArtefact(forDataSpecificationIri, artefact?.iri as string, dict);
  return dict;
}
