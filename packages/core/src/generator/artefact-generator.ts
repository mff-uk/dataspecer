import {StreamDictionary} from "../io/stream/stream-dictionary";
import {
  DataSpecification,
  DataSpecificationArtefact,
} from "../data-specification/model";
import {ArtefactGeneratorContext} from "./artefact-generator-context";

/**
 * High level generator interface. The generator must not change
 * any of the given models.
 */
export interface ArtefactGenerator {

  identifier(): string;

  /**
   * Generate the content and writes is to the output. This function should
   * call {@link generateToStream} and after that only convert it to stream.
   */
  generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary): Promise<void>;

  /**
   * Generate the content object representation and returns it. Design to allow
   * call of a generator from another generator.
   *
   * It this functionality is not supported the function must return null.
   */
  generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ): Promise<unknown | null>;

}
