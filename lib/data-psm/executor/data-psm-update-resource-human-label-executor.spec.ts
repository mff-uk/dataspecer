import {createEmptyCoreResource} from "../../core";
import {asDataPsmUpdateResourceHumanLabel} from "../operation";
import {
  executeDataPsmUpdateResourceHumanLabel,
} from "./data-psm-update-resource-human-label-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

test("Update data PSM resource human label.", async () => {
  const operation =
    asDataPsmUpdateResourceHumanLabel(createEmptyCoreResource());
  operation.dataPsmResource = "http://class";
  operation.dataPsmHumanLabel = {"en": "label"};

  const before = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmUpdateResourceHumanLabel(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmHumanLabel": operation.dataPsmHumanLabel,
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
  expect(actual.deletedResource).toEqual([]);
});
