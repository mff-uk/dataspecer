import {
  CoreResource,
  CoreResourceReader,
  ReadOnlyMemoryStore,
} from "../../core";
import { DataPsmDeleteClass } from "../operation";
import { executeDataPsmDeleteClass } from "./data-psm-delete-class-executor";
import * as PSM from "../data-psm-vocabulary";

test("Delete data PSM class.", async () => {
  const operation = new DataPsmDeleteClass();
  operation.dataPsmClass = "http://class";

  const before = {
    "http://schema": {
      iri: "http://schema",
      types: [PSM.SCHEMA],
      dataPsmRoots: ["http://class"],
      dataPsmParts: ["http://class"],
    },
    "http://class": {
      iri: "http://class",
      types: [PSM.CLASS],
      dataPsmExtends: [],
      dataPsmParts: [],
    },
  };

  const actual = await executeDataPsmDeleteClass(
    wrapResourcesWithReader(before),
    undefined,
    operation
  );

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      iri: "http://schema",
      types: [PSM.SCHEMA],
      dataPsmRoots: [],
      dataPsmParts: [],
    },
  });
  expect(actual.deleted).toEqual(["http://class"]);
});

function wrapResourcesWithReader(resources: {
  [iri: string]: CoreResource;
}): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
