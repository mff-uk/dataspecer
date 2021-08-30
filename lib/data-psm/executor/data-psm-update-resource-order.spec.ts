import {CoreResourceReader, createCoreResource} from "../../core";
import {
  asDataPsmUpdateResourceOrder,
} from "../operation";
import {
  executeDataPsmUpdateResourceOrder,
} from "./data-psm-update-resource-order-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

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
    const operation =
      asDataPsmUpdateResourceOrder(createCoreResource());
    operation.dataPsmOwnerClass = "http://class";
    operation.dataPsmResourceToMove = "http://attribute/1";
    operation.dataPsmMoveAfter = "http://attribute/2";

    const actual = await executeDataPsmUpdateResourceOrder(
      undefined,
      wrapResourcesWithReader(resources),
      operation);

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
      }
    });
    expect(actual.deleted).toEqual([]);
  });

  test("Move to the first position.", async () => {
    const operation =
      asDataPsmUpdateResourceOrder(createCoreResource());
    operation.dataPsmOwnerClass = "http://class";
    operation.dataPsmResourceToMove = "http://attribute/1";
    operation.dataPsmMoveAfter = null;

    const actual = await executeDataPsmUpdateResourceOrder(
      undefined,
      wrapResourcesWithReader(resources),
      operation);

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
  return new ReadOnlyMemoryStore(resources);
}
