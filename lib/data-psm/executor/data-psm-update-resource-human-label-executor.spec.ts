import {CoreResourceReader, createCoreResource} from "../../core";
import {asDataPsmUpdateResourceHumanLabel} from "../operation";
import {
  executeDataPsmUpdateResourceHumanLabel,
} from "./data-psm-update-resource-human-label-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Update data PSM resource human label.", async () => {
  const operation =
    asDataPsmUpdateResourceHumanLabel(createCoreResource());
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

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmHumanLabel": operation.dataPsmHumanLabel,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
