import {CoreResourceReader, createCoreResource} from "../../core";
import {asDataPsmUpdateResourceHumanDescription} from "../operation";
import {
  executeDataPsmUpdateResourceHumanDescription,
} from "./data-psm-update-resource-human-description-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Update data PSM resource human description.", async () => {
  const operation =
    asDataPsmUpdateResourceHumanDescription(createCoreResource());
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

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmHumanDescription": operation.dataPsmHumanDescription,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
