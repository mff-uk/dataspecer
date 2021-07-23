import {CoreResourceMap} from "../../core/model";
import {ObjectModelSchema} from "../object-model";
import {ObjectModelSchemaAdapter} from "./object-model-schema-adapter";

export function createObjectModelFromCoreModel(
  entities: CoreResourceMap, iri: string,
): ObjectModelSchema {
  return (new ObjectModelSchemaAdapter(entities)).loadSchemaFromPsmSchema(iri);
}
