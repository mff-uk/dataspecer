import {CoreResourceReader, createCoreResource} from "../../core";
import {asDataPsmDeleteAttribute} from "../operation";
import {
  executesDataPsmDeleteAttribute,
} from "./data-psm-delete-attribute-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Delete data PSM attribute.", async () => {
  const operation = asDataPsmDeleteAttribute(createCoreResource());
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

  const actual = await executesDataPsmDeleteAttribute(
    undefined,
    wrapResourcesWithReader(before),
    operation);

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
  return new ReadOnlyMemoryStore(resources);
}
