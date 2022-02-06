import {
  CoreResource,
  CoreResourceReader,
  ReadOnlyMemoryStore,
} from "../../core";
import { DataPsmSetInterpretation } from "../operation";
import { executeDataPsmSetInterpretation } from "./data-psm-set-interpretation-executor";
import * as PSM from "../data-psm-vocabulary";

test("Update data PSM resource interpretation.", async () => {
  const operation = new DataPsmSetInterpretation();
  operation.dataPsmResource = "http://class";
  operation.dataPsmInterpretation = "http://interpretation";

  const before = {
    "http://class": {
      iri: "http://class",
      types: [PSM.CLASS],
    },
  };

  const actual = await executeDataPsmSetInterpretation(
    wrapResourcesWithReader(before),
    undefined,
    operation
  );

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://class": {
      iri: "http://class",
      types: [PSM.CLASS],
      dataPsmInterpretation: operation.dataPsmInterpretation,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(resources: {
  [iri: string]: CoreResource;
}): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
