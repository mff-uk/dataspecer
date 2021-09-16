import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmDeleteClass} from "../operation";
import {
  executeDataPsmDeleteClass,
} from "./data-psm-delete-class-executor";

test("Delete data PSM class.", async () => {
  const operation = new DataPsmDeleteClass();
  operation.dataPsmClass = "http://class";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmRoots": ["http://class"],
      "dataPsmParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmExtends": [],
      "dataPsmParts": [],
    },
  };

  const actual = await executeDataPsmDeleteClass(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmRoots": [],
      "dataPsmParts": [],
    },
  });
  expect(actual.deleted).toEqual(["http://class"]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
