import {createCoreResource} from "../../core";
import {asDataPsmUpdateResourceOrder} from "../operation";
import {executeDataPsmUpdateResourceOrder} from "./data-psm-update-resource-order-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

describe("Change order in data PSM class.", () => {
  let before: Record<string, unknown>;

  beforeEach(() => {
    before = {
      "http://schema": {
        "iri": "http://schema",
        "types": ["data-psm-schema"],
        "dataPsmParts": ["http://class"],
      },
      "http://class": {
        "iri": "http://class",
        "types": ["data-psm-class"],
        "dataPsmParts": [
          "http://attribute/0", "http://attribute/1",
          "http://attribute/2", "http://attribute/3",
        ],
      },
      "http://attribute/1": {
        "iri": "http://attribute/1",
        "types": ["data-psm-class"],
      },
      "http://attribute/2": {
        "iri": "http://attribute/2",
        "types": ["data-psm-class"],
      },
    };
  });

  test("move inside", async () => {
    const operation =
        asDataPsmUpdateResourceOrder(createCoreResource());
    operation.dataPsmOwnerClass = "http://class";
    operation.dataPsmResourceToMove = "http://attribute/1";
    operation.dataPsmMoveAfter = "http://attribute/2";

    const actual = await executeDataPsmUpdateResourceOrder(
      undefined,
      wrapResourcesWithReader(before),
      operation);

    const expected = {
      "http://class": {
        "iri": "http://class",
        "types": ["data-psm-class"],
        "dataPsmParts": [
          "http://attribute/0", "http://attribute/2",
          "http://attribute/1", "http://attribute/3",
        ],
      },
    };

    expect(actual.failed).toBeFalsy();
    expect(actual.changedResources).toEqual(expected);
    expect(actual.deletedResource).toEqual([]);
  });

  test("move to the first position", async () => {
    const operation =
        asDataPsmUpdateResourceOrder(createCoreResource());
    operation.dataPsmOwnerClass = "http://class";
    operation.dataPsmResourceToMove = "http://attribute/1";
    operation.dataPsmMoveAfter = null;

    const actual = await executeDataPsmUpdateResourceOrder(
      undefined,
      wrapResourcesWithReader(before),
      operation);

    const expected = {
      "http://class": {
        "iri": "http://class",
        "types": ["data-psm-class"],
        "dataPsmParts": [
          "http://attribute/1", "http://attribute/0",
          "http://attribute/2", "http://attribute/3",
        ],
      },
    };

    expect(actual.failed).toBeFalsy();
    expect(actual.changedResources).toEqual(expected);
    expect(actual.deletedResource).toEqual([]);
  });
  
});
