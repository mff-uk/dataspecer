import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {PimSetExtends} from "../operation";
import * as PIM from "../pim-vocabulary";
import {executePimSetExtends} from "./pim-set-extends-executor";

test("Update resource extends.", async () => {
  const operation = new PimSetExtends(
  );
  operation.pimExtends = ["http://parent"];
  operation.pimResource = "http://class";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": [PIM.SCHEMA],
      "pimParts": ["http://class", "http://localhost/1"],
    },
    "http://class": {
      "iri": "http://class",
      "types": [PIM.CLASS],
    },
    "http://parent": {
      "iri": "http://parent",
      "types": [PIM.CLASS],
    },
  };

  const actual = await executePimSetExtends(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://class": {
      "iri": "http://class",
      "types": [PIM.CLASS],
      "pimExtends": operation.pimExtends,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
