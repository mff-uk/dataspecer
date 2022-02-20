import {
  CoreResource,
  CoreResourceReader,
  ReadOnlyMemoryStore,
} from "../../core";
import { DataPsmSetPart } from "../operation";
import { executeDataPsmSetPart } from "./data-psm-set-part-executor";
import * as PSM from "../data-psm-vocabulary";
import { DataPsmAssociationEnd, DataPsmClassReference } from "../model";

test("Update data PSM association end resource part.", async () => {
  const operation = new DataPsmSetPart();
  operation.dataPsmAssociationEnd = "http://association-end";
  operation.dataPsmPart = "http://new-part";

  const before = {
    "http://association-end": {
      iri: "http://association-end",
      types: [PSM.ASSOCIATION_END],
      dataPsmPart: "http://old-part",
    } as DataPsmAssociationEnd,
    "http://new-part": {
      iri: "http://new-part",
      types: [PSM.CLASS_REFERENCE],
    } as DataPsmClassReference,
  };

  const actual = await executeDataPsmSetPart(
    wrapResourcesWithReader(before),
    undefined,
    operation
  );

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://association-end": {
      iri: "http://association-end",
      types: [PSM.ASSOCIATION_END],
      dataPsmPart: operation.dataPsmPart,
    } as DataPsmAssociationEnd,
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(resources: {
  [iri: string]: CoreResource;
}): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
