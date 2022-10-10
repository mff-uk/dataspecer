import {DataSpecification, DataSpecificationArtefact} from "@dataspecer/core/data-specification/model";
import {Generator} from "@dataspecer/core/generator";
import {MemoryStreamDictionary} from "@dataspecer/core/io/stream/memory-stream-dictionary";
import {CoreResourceReader} from "@dataspecer/core/core";
import {getArtefactGenerators} from "../../../artefact-generators";
import {getDefaultConfigurators} from "../../../configurators";
import { DefaultArtifactConfigurator } from "../../../default-artifact-configurator";

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
  store: CoreResourceReader,
  forDataSpecificationIri: string,
  dataSpecifications: { [key: string]: DataSpecification },
  artifactSelector: (artifact: DataSpecificationArtefact) => boolean,
  configuration: object,
): Promise<[string, string]> {
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
  const path = artefact?.outputPath;

  // Generate the artifact and return it

  const generator = new Generator(
      Object.values(dataSpecificationsWithArtifacts),
      store,
      getArtefactGenerators());
  const dict = new MemoryStreamDictionary();
  await generator.generateArtefact(forDataSpecificationIri, artefact?.iri as string, dict);
  const stream = dict.readPath(path as string);
  return [await stream.read() as string, path?.split("/").pop() as string];
}
