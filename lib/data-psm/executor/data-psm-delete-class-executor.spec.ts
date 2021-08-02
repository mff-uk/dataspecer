import {createEmptyCoreResource} from "../../core";
import {asDataPsmDeleteClass} from "../operation";
import {
  executesDataPsmDeleteClass,
} from "./data-psm-delete-class-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

test("Delete data PSM class.", async () => {
  const operation = asDataPsmDeleteClass(createEmptyCoreResource());
  operation.dataPsmClass = "http://class";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmRoots": ["http://class"],
      "dataPsmParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmParts": [],
    },
  };

  const actual = await executesDataPsmDeleteClass(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmRoots": [],
      "dataPsmParts": [],
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
  expect(actual.deletedResource).toEqual(["http://class"]);
});
