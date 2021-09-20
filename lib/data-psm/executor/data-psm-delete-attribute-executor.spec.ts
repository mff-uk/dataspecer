import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmDeleteAttribute} from "../operation";
import {
  executeDataPsmDeleteAttribute,
} from "./data-psm-delete-attribute-executor";

test("Delete data PSM attribute.", async () => {
  const operation = new DataPsmDeleteAttribute();
  operation.dataPsmOwner = "http://class";
  operation.dataPsmAttribute = "http://attribute";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://class", "http://attribute"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmParts": ["http://attribute"],
    },
    "http://attribute": {
      "iri": "http://attribute",
      "types": ["data-psm-attribute"],
    },
  };

  const actual = await executeDataPsmDeleteAttribute(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmParts": [],
    },
  });
  expect(actual.deleted).toEqual(["http://attribute"]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
