import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmSetOrder} from "../operation";
import {
  executeDataPsmSetOrder,
} from "./data-psm-set-order-executor";

describe("Change order in data PSM class.", () => {

  let resources: Record<string, unknown>;

  beforeEach(() => {
    resources = {
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

  test("Move inside a list.", async () => {
    const operation =new DataPsmSetOrder();
    operation.dataPsmOwnerClass = "http://class";
    operation.dataPsmResourceToMove = "http://attribute/1";
    operation.dataPsmMoveAfter = "http://attribute/2";

    const actual = await executeDataPsmSetOrder(
      wrapResourcesWithReader(resources),
      undefined, operation);

    expect(actual.failed).toBeFalsy();
    expect(actual.created).toEqual({});
    expect(actual.changed).toEqual({
      "http://class": {
        "iri": "http://class",
        "types": ["data-psm-class"],
        "dataPsmParts": [
          "http://attribute/0", "http://attribute/2",
          "http://attribute/1", "http://attribute/3",
        ],
      },
    });
    expect(actual.deleted).toEqual([]);
  });

  test("Move to the first position.", async () => {
    const operation =new DataPsmSetOrder();
    operation.dataPsmOwnerClass = "http://class";
    operation.dataPsmResourceToMove = "http://attribute/1";
    operation.dataPsmMoveAfter = null;

    const actual = await executeDataPsmSetOrder(
      wrapResourcesWithReader(resources),
      undefined, operation);

    expect(actual.failed).toBeFalsy();
    expect(actual.created).toEqual({});
    expect(actual.changed).toEqual({
      "http://class": {
        "iri": "http://class",
        "types": ["data-psm-class"],
        "dataPsmParts": [
          "http://attribute/1", "http://attribute/0",
          "http://attribute/2", "http://attribute/3",
        ],
      },
    });
    expect(actual.deleted).toEqual([]);
  });

});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
