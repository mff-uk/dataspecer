import {
  CoreResourceReader,
  createCoreResource,
} from "../../core";
import {asPimDeleteAttribute} from "../operation";
import {
  executePimDeleteAttribute,
} from "./pim-delete-attribute-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Delete attribute.", async () => {
  const operation = asPimDeleteAttribute(createCoreResource());
  operation.pimAttribute = "http://localhost/1";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": [
        "http://localhost/1",
      ],
    },
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-attribute"],
    },
  };

  const actual = await executePimDeleteAttribute(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": [],
    },
  });
  expect(actual.deleted.sort()).toEqual([
    "http://localhost/1",
  ].sort());
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
