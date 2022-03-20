import {DataSpecification, DataSpecificationArtefact} from "@model-driven-data/core/data-specification/model";
import {createDefaultGenerator} from "@model-driven-data/core/generator";
import {MemoryStreamDictionary} from "@model-driven-data/core/io/stream/memory-stream-dictionary";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {DefaultArtifactConfigurator} from "../../store/default-artifact-configurator";

/**
 * Returns a single generated artifact based on the given artifact definition.
 * @param store
 * @param forDataSpecificationIri
 * @param dataSpecifications
 * @param artifactSelector Function that returns true for the artifact
 * definition that should be generated.
 */
export async function getSingleArtifact(
  store: CoreResourceReader,
  forDataSpecificationIri: string,
  dataSpecifications: { [key: string]: DataSpecification },
  artifactSelector: (artifact: DataSpecificationArtefact) => boolean,
): Promise<string> {
  // Generate artifacts definitions

  const defaultArtifactConfigurator = new DefaultArtifactConfigurator(Object.values(dataSpecifications), store);
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

  const generator = createDefaultGenerator(Object.values(dataSpecificationsWithArtifacts), store);
  const dict = new MemoryStreamDictionary();
  await generator.generateArtefact(forDataSpecificationIri, artefact?.iri as string, dict);
  const stream = dict.readPath(path as string);
  return await stream.read() as string;
}
