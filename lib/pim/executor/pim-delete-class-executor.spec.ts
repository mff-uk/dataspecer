import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {PimDeleteClass} from "../operation";
import {executePimDeleteClass} from "./pim-delete-class-executor";

test("Delete class.", async () => {
  const operation = new PimDeleteClass();
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
    wrapResourcesWithReader(before),
    undefined, operation);

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
  return ReadOnlyMemoryStore.create(resources);
}
