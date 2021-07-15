import {EntitySchemaAdapter} from "./entity-schema-adapter";
import {ModelResource} from "../platform-model/platform-model-api";
import {SchemaData} from "./entity-model";

export function loadEntitySchemaFromIri(
  entities: Record<string, ModelResource>, iri: string,
): SchemaData {
  const adapter = new EntitySchemaAdapter(entities);
  return adapter.loadPsmSchemaFromIri(iri);
}
