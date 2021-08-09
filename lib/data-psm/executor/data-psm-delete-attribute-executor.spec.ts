import {createCoreResource} from "../../core";
import {asDataPsmDeleteAttribute} from "../operation";
import {
  executesDataPsmDeleteAttribute,
} from "./data-psm-delete-attribute-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

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

  const expected = {
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
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
  expect(actual.deletedResource).toEqual(["http://attribute"]);
});
