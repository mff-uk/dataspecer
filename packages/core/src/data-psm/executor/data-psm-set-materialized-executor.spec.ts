import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmSetMaterialized} from "../operation";
import {
  executeDataPsmSetMaterialized,
} from "./data-psm-set-materialized-executor";
import * as PSM from "../data-psm-vocabulary";
import {DataPsmAssociationEnd, DataPsmClassReference} from "../model";

test("Update data PSM association materialized.", async () => {
  const operation = new DataPsmSetMaterialized();
  operation.dataPsmAssociationEnd = "http://association-end";
  operation.dataPsmIsMaterialized = true;

  const before = {
    "http://association-end": {
      iri: "http://association-end",
      types: [PSM.ASSOCIATION_END],
      dataPsmPart: "http://part",
    } as DataPsmAssociationEnd,
    "http://part": {
      iri: "http://part",
      types: [PSM.CLASS_REFERENCE],
    } as DataPsmClassReference,
  };

  const actual = await executeDataPsmSetMaterialized(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://association-end": {
      iri: "http://association-end",
      types: [PSM.ASSOCIATION_END],
      dataPsmPart: "http://part",
      dataPsmIsMaterialized: operation.dataPsmIsMaterialized,
    } as DataPsmAssociationEnd,
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
