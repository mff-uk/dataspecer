import {
  CoreResource,
  CoreResourceReader,
  createCoreResource,
} from "../../core";
import {asPimDeleteClass} from "../operation";
import {
  executePimDeleteClass,
} from "./pim-delete-class-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Delete class.", async () => {
  const operation = asPimDeleteClass(createCoreResource());
  operation.pimClass = "http://localhost/1";

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
      "types": ["pim-class"],
    },
  };

  const actual = await executePimDeleteClass(
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
