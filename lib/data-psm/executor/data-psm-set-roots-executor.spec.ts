import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmSetRoots} from "../operation";
import {executeDataPsmSetRoots} from "./data-psm-set-roots-executor";

test("Set data PSM class as a schema root.", async () => {
  const operation = new DataPsmSetRoots();
  operation.dataPsmRoots = ["http://class"];

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmSetRoots(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmRoots": operation.dataPsmRoots,
      "dataPsmParts": ["http://class"],
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
