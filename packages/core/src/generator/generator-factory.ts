import {DataSpecification} from "../data-specification/model";
import {CoreResourceReader} from "../core";
import {Generator} from "./generator";
import {BikeshedGenerator} from "../bikeshed";
import {JsonSchemaGenerator} from "../json-schema/json-schema-generator";

/**
 * Use this to get generator with included artefact generators from this
 * repository.
 */
export function createDefaultGenerator(
  specifications: DataSpecification[],
  reader: CoreResourceReader,
): Generator {
  return new Generator(specifications, reader,
    [
      new BikeshedGenerator(),
      new JsonSchemaGenerator(),
    ]);
}