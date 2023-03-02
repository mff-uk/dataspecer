import { structureModelToJsonSchema } from "./json-schema-model-adapter";
import { writeJsonSchema } from "./json-schema-writer";
import {
  CoreResource,
  ReadOnlyMemoryStore,
  defaultStringSelector,
} from "@dataspecer/core/core";
import { MemoryOutputStream } from "@dataspecer/core/io/stream/memory-output-stream";
import { coreResourcesToStructuralModel } from "@dataspecer/core/structure-model";
import { DataSpecification } from "@dataspecer/core/data-specification/model";
import { DefaultJsonConfiguration } from "../configuration";

test.skip("Convert to json-schema.", async () => {
  const resources = {};
  const store = ReadOnlyMemoryStore.create(
    resources as { [iri: string]: CoreResource }
  );
  const model = await coreResourcesToStructuralModel(store, "");
  const specification = new DataSpecification();
  specification.iri = "root;";

  const actual = structureModelToJsonSchema(
    { root: specification },
    specification,
    model,
    DefaultJsonConfiguration,
    defaultStringSelector
  );

  console.log(JSON.stringify(model, null, 2));
  console.log(JSON.stringify(actual, null, 2));
  const stream = new MemoryOutputStream();
  await writeJsonSchema(actual, stream);
  console.log(stream.getContent());
});
