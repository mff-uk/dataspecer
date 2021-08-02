import {createEmptyCoreResource} from "../../core";
import {
  asDataPsmUpdateSchemaRoots,
} from "../operation";
import {
  executeDataPsmUpdateSchemaRoots,
} from "./data-psm-update-schema-roots-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

test("Set data PSM class as a schema root.", async () => {
  const operation =
    asDataPsmUpdateSchemaRoots(createEmptyCoreResource());
  operation.dataPsmRoots = ["http://class"];

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmUpdateSchemaRoots(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmRoots": operation.dataPsmRoots,
      "dataPsmParts": ["http://class"],
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
  expect(actual.deletedResource).toEqual([]);
});
