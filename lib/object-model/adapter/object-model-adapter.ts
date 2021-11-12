import {CoreResourceReader} from "../../core";
import {ObjectModelSchema} from "../model";
import {ObjectModelSchemaAdapter} from "./object-model-schema-adapter";

export async function coreResourcesToObjectModel(
  reader: CoreResourceReader, iri: string,
): Promise<ObjectModelSchema> {
  return (new ObjectModelSchemaAdapter(reader))
    .loadSchemaFromDataPsmSchema(iri);
}
