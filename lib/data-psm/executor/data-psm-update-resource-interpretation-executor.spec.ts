import {createEmptyCoreResource} from "../../core";
import {
  asDataPsmUpdateResourceInterpretation,
} from "../operation";
import {
  executeDataPsmUpdateResourceInterpretation,
} from "./data-psm-update-resource-interpretation-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

test("Update data PSM resource interpretation.", async () => {
  const operation =
    asDataPsmUpdateResourceInterpretation(createEmptyCoreResource());
  operation.dataPsmResource = "http://class";
  operation.dataPsmInterpretation = "http://interpretation";

  const before = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmUpdateResourceInterpretation(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmInterpretation": operation.dataPsmInterpretation,
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
  expect(actual.deletedResource).toEqual([]);
});
