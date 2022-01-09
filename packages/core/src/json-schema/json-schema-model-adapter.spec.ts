import {structureModelToJsonSchema} from "./json-schema-model-adapter";
import {writeJsonSchema} from "./json-schema-writer";
import {
  CoreResource,
  ReadOnlyMemoryStore,
  defaultStringSelector,
} from "../core";
import {MemoryOutputStream} from "../io/stream/memory-output-stream";
import {coreResourcesToStructuralModel} from "../structure-model";

test.skip("Convert to json-schema.", async () => {
  const resources = {};
  const store = ReadOnlyMemoryStore.create(
    resources as { [iri: string]: CoreResource }
  );
  const model = await coreResourcesToStructuralModel(
    store, "");
  const actual = structureModelToJsonSchema(
    model, defaultStringSelector);
  console.log(JSON.stringify(model, null, 2));
  console.log(JSON.stringify(actual, null, 2));
  const stream = new MemoryOutputStream();
  await writeJsonSchema(actual, stream)
  console.log(stream.getContent());
});
