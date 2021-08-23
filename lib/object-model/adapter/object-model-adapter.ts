import {CoreModelReader} from "../../core";
import {ObjectModelSchema} from "../object-model";
import {ObjectModelSchemaAdapter} from "./object-model-schema-adapter";

export async function createObjectModelFromCoreModel(
  reader: CoreModelReader, iri: string,
): Promise<ObjectModelSchema> {
  return (new ObjectModelSchemaAdapter(reader)).loadSchemaFromDataPsmSchema(iri);
}
