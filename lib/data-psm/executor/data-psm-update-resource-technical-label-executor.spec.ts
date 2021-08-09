import {createCoreResource} from "../../core";
import {
  asDataPsmUpdateResourceTechnicalLabel,
} from "../operation";
import {
  executeDataPsmUpdateResourceTechnicalLabel,
} from "./data-psm-update-resource-technical-label-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

test("Update data PSM resource technical label.", async () => {
  const operation =
    asDataPsmUpdateResourceTechnicalLabel(createCoreResource());
  operation.dataPsmResource = "http://class";
  operation.dataPsmTechnicalLabel = "technical";

  const before = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmUpdateResourceTechnicalLabel(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmTechnicalLabel": operation.dataPsmTechnicalLabel,
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
  expect(actual.deletedResource).toEqual([]);
});
