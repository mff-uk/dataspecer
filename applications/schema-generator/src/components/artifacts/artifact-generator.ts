import {FederatedObservableStore} from "../../store/federated-observable-store";
import {DataSpecificationArtefact} from "@model-driven-data/core/data-specification/model";
import {getDataSpecificationsFromStore} from "../../store/emulate-data-specification";
import {ArtifactDefinitionConfigurator} from "../../store/artifact-definition-configurator";
import {createDefaultGenerator} from "@model-driven-data/core/generator";
import {MemoryStreamDictionary} from "@model-driven-data/core/io/stream/memory-stream-dictionary";

/**
 * Returns a single generated artifact based on the given artifact definition.
 * @param store
 * @param artifactSelector Function that returns true for the artifact
 * definition that should be generated.
 */
export async function getGeneratedArtifactFromRoot(
  store: FederatedObservableStore,
  artifactSelector: (artifact: DataSpecificationArtefact) => boolean,
): Promise<string> {
  const [
    dataSpecifications,
    generatorOptions,
    rootSpecification
  ] = await getDataSpecificationsFromStore(store);

  const configurator = new ArtifactDefinitionConfigurator(dataSpecifications, store);
  for (const dataSpecification of dataSpecifications) {
    await configurator.setConfigurationForSpecification(
      dataSpecification.iri as string,
      generatorOptions[dataSpecification.iri as string],
    );
  }

  const artefact = dataSpecifications
    .find(specification => specification.iri === rootSpecification)
    ?.artefacts
    ?.find(artifactSelector);
  const path = artefact?.outputPath;

  const generator = createDefaultGenerator(dataSpecifications, store);
  const dict = new MemoryStreamDictionary();
  await generator.generateArtefact(rootSpecification, artefact?.iri as string, dict);
  const stream = dict.readPath(path as string);
  return await stream.read() as string;
}
