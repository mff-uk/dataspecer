import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmDeleteClassReference} from "../operation";
import {
  executeDataPsmDeleteClassReference,
} from "./data-psm-delete-class-reference-executor";
import * as PSM from "../data-psm-vocabulary";

test("Delete data PSM class.", async () => {
  const operation = new DataPsmDeleteClassReference();
  operation.dataPsmClassReference = "http://class";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": [PSM.SCHEMA],
      "dataPsmRoots": [],
      "dataPsmParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": [PSM.CLASS_REFERENCE],
      "dataPsmSpecification": "",
    },
  };

  const actual = await executeDataPsmDeleteClassReference(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": [PSM.SCHEMA],
      "dataPsmRoots": [],
      "dataPsmParts": [],
    },
  });
  expect(actual.deleted).toEqual(["http://class"]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
