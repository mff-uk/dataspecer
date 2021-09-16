import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmSetTechnicalLabel} from "../operation";
import {
  executeDataPsmSetTechnicalLabel,
} from "./data-psm-set-technical-label-executor";

test("Update data PSM resource technical label.", async () => {
  const operation = new DataPsmSetTechnicalLabel();
  operation.dataPsmResource = "http://class";
  operation.dataPsmTechnicalLabel = "technical";

  const before = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmSetTechnicalLabel(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmTechnicalLabel": operation.dataPsmTechnicalLabel,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
