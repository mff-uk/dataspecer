import {createEmptyCoreResource} from "../../core";
import {asDataPsmUpdateResourceHumanDescription} from "../operation";
import {
  executeDataPsmUpdateResourceHumanDescription,
} from "./data-psm-update-resource-human-description-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

test("Update data PSM resource human description.", async () => {
  const operation=
    asDataPsmUpdateResourceHumanDescription(createEmptyCoreResource());
  operation.dataPsmResource = "http://class";
  operation.dataPsmHumanDescription = {"cs": "popis"};

  const before = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmUpdateResourceHumanDescription(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmHumanDescription": operation.dataPsmHumanDescription,
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
  expect(actual.deletedResource).toEqual([]);
});
