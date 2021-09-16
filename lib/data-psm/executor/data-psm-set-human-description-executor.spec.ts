import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmSetHumanDescription} from "../operation";
import {
  executeDataPsmSetHumanDescription,
} from "./data-psm-set-human-description-executor";

test("Update data PSM resource human description.", async () => {
  const operation = new DataPsmSetHumanDescription();
  operation.dataPsmResource = "http://class";
  operation.dataPsmHumanDescription = {"cs": "popis"};

  const before = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmSetHumanDescription(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmHumanDescription": operation.dataPsmHumanDescription,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
