import {
  CoreResource,
  CoreResourceReader,
  ReadOnlyMemoryStore,
} from "../../core";
import { DataPsmSetHumanDescription } from "../operation";
import { executeDataPsmSetHumanDescription } from "./data-psm-set-human-description-executor";
import * as PSM from "../data-psm-vocabulary";

test("Update data PSM resource human description.", async () => {
  const operation = new DataPsmSetHumanDescription();
  operation.dataPsmResource = "http://class";
  operation.dataPsmHumanDescription = { cs: "popis" };

  const before = {
    "http://class": {
      iri: "http://class",
      types: [PSM.CLASS],
    },
  };

  const actual = await executeDataPsmSetHumanDescription(
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
      dataPsmHumanDescription: operation.dataPsmHumanDescription,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(resources: {
  [iri: string]: CoreResource;
}): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
