import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmSetInterpretation} from "../operation";
import {
  executeDataPsmSetInterpretation,
} from "./data-psm-set-interpretation-executor";

test("Update data PSM resource interpretation.", async () => {
  const operation = new DataPsmSetInterpretation();
  operation.dataPsmResource = "http://class";
  operation.dataPsmInterpretation = "http://interpretation";

  const before = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmSetInterpretation(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmInterpretation": operation.dataPsmInterpretation,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
