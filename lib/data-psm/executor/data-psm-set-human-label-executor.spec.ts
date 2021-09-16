import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmSetHumanLabel} from "../operation";
import {
  executeDataPsmSetHumanLabel,
} from "./data-psm-set-human-label-executor";

test("Update data PSM resource human label.", async () => {
  const operation = new DataPsmSetHumanLabel();
  operation.dataPsmResource = "http://class";
  operation.dataPsmHumanLabel = {"en": "label"};

  const before = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmSetHumanLabel(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmHumanLabel": operation.dataPsmHumanLabel,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
